"""DRF serializers for the public smart home API."""

import os
import re

from django.conf import settings
from rest_framework import serializers

from .constants import FLOORPLAN_ALLOWED_EXTENSIONS, SMART_MODULES
from .models import (
    ArchitectPartnerInquiry,
    ReferenceInstallation,
    ReferencePhoto,
    SmartHomeConsultationRequest,
    SmartSolution,
    SolutionDomain,
)

PHONE_RE = re.compile(r"^\+?[0-9\s/()-]{9,20}$")


def validate_phone_number(value: str) -> str:
    value = (value or "").strip()
    if not PHONE_RE.match(value) or sum(ch.isdigit() for ch in value) < 9:
        raise serializers.ValidationError("Zadajte platné telefónne číslo, napr. +421 900 123 456.")
    return value


class StringListField(serializers.ListField):
    """List of strings that also accepts a JSON string or comma separated value (multipart forms)."""

    child = serializers.CharField(max_length=120)

    def to_internal_value(self, data):
        import json

        # QueryDict from multipart: either repeated keys or a single JSON / CSV string.
        if hasattr(data, "getlist"):
            data = data.getlist(self.field_name)
        if isinstance(data, list) and len(data) == 1 and isinstance(data[0], str):
            data = data[0]
        if isinstance(data, str):
            raw = data.strip()
            if raw.startswith("["):
                try:
                    data = json.loads(raw)
                except json.JSONDecodeError as exc:
                    raise serializers.ValidationError("Neplatný formát zoznamu.") from exc
            else:
                data = [item.strip() for item in raw.split(",") if item.strip()]
        return super().to_internal_value(data)

    def get_value(self, dictionary):
        if hasattr(dictionary, "getlist"):
            if self.field_name not in dictionary:
                return serializers.empty
            values = dictionary.getlist(self.field_name)
            return values
        return super().get_value(dictionary)


# --- Catalogue ----------------------------------------------------------------


class SolutionDomainSerializer(serializers.ModelSerializer):
    solution_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = SolutionDomain
        fields = ["id", "name", "slug", "short_summary", "icon_name", "display_order", "solution_count"]


class DomainMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolutionDomain
        fields = ["id", "name", "slug", "icon_name"]


class SmartSolutionListSerializer(serializers.ModelSerializer):
    domain = DomainMiniSerializer(read_only=True)

    class Meta:
        model = SmartSolution
        fields = [
            "id",
            "name",
            "slug",
            "domain",
            "short_description",
            "supported_protocols",
            "energy_saving_note",
            "starting_price_eur",
            "cover_image_url",
            "is_featured",
        ]


class SmartSolutionDetailSerializer(SmartSolutionListSerializer):
    related_solutions = serializers.SerializerMethodField()

    class Meta(SmartSolutionListSerializer.Meta):
        fields = SmartSolutionListSerializer.Meta.fields + [
            "detailed_description",
            "everyday_benefits",
            "related_solutions",
        ]

    def get_related_solutions(self, obj: SmartSolution):
        related = (
            SmartSolution.objects.select_related("domain")
            .exclude(pk=obj.pk)
            .order_by("-is_featured", "domain__display_order")[:3]
        )
        return SmartSolutionListSerializer(related, many=True, context=self.context).data


class ReferencePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferencePhoto
        fields = ["id", "image_url", "caption", "display_order"]


class ReferenceListSerializer(serializers.ModelSerializer):
    property_type_display = serializers.CharField(source="get_property_type_display", read_only=True)

    class Meta:
        model = ReferenceInstallation
        fields = [
            "id",
            "title",
            "slug",
            "property_type",
            "property_type_display",
            "location_city",
            "floor_area_sqm",
            "system_platform",
            "measured_benefit",
            "cover_image_url",
            "completion_year",
            "is_featured",
            "display_order",
        ]


class ReferenceDetailSerializer(ReferenceListSerializer):
    photos = ReferencePhotoSerializer(many=True, read_only=True)

    class Meta(ReferenceListSerializer.Meta):
        fields = ReferenceListSerializer.Meta.fields + ["client_vision", "implemented_features", "photos"]


# --- Lead submission ----------------------------------------------------------


class SmartHomeConsultationRequestSerializer(serializers.ModelSerializer):
    selected_modules = StringListField(required=False, allow_empty=True)
    gdpr_consent = serializers.BooleanField(write_only=True)

    class Meta:
        model = SmartHomeConsultationRequest
        fields = [
            "id",
            "inquiry_goal",
            "property_type",
            "construction_stage",
            "floor_area_sqm",
            "selected_modules",
            "floorplan_file",
            "location_city",
            "client_name",
            "email",
            "phone",
            "notes",
            "estimated_budget",
            "gdpr_consent",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            "inquiry_goal": {"error_messages": {"invalid_choice": "Vyberte cieľ dopytu."}},
            "property_type": {"error_messages": {"invalid_choice": "Vyberte typ nehnuteľnosti."}},
            "construction_stage": {"error_messages": {"invalid_choice": "Vyberte fázu stavby."}},
            "floorplan_file": {"write_only": True},
        }

    def validate_client_name(self, value: str) -> str:
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Zadajte meno a priezvisko.")
        return value

    def validate_location_city(self, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Zadajte lokalitu stavby.")
        return value

    def validate_phone(self, value: str) -> str:
        return validate_phone_number(value)

    def validate_selected_modules(self, value: list[str]) -> list[str]:
        unknown = [item for item in value if item not in SMART_MODULES]
        if unknown:
            raise serializers.ValidationError(f"Neznámy modul: {', '.join(unknown)}.")
        # Preserve order, drop duplicates.
        return list(dict.fromkeys(value))

    def validate_floorplan_file(self, file):
        if not file:
            return file
        ext = os.path.splitext(file.name)[1].lower()
        if ext not in FLOORPLAN_ALLOWED_EXTENSIONS:
            raise serializers.ValidationError("Povolené formáty: PDF, DWG, DXF, PNG, JPG alebo WEBP.")
        max_bytes = settings.FLOORPLAN_MAX_UPLOAD_BYTES
        if file.size > max_bytes:
            raise serializers.ValidationError(
                f"Súbor je príliš veľký. Maximálna veľkosť je {max_bytes // (1024 * 1024)} MB."
            )
        return file

    def validate_gdpr_consent(self, value: bool) -> bool:
        if not value:
            raise serializers.ValidationError("Pre odoslanie dopytu je potrebný súhlas so spracovaním údajov.")
        return value


class ArchitectPartnerInquirySerializer(serializers.ModelSerializer):
    gdpr_consent = serializers.BooleanField(write_only=True)

    class Meta:
        model = ArchitectPartnerInquiry
        fields = [
            "id",
            "partner_role",
            "studio_or_company_name",
            "contact_name",
            "email",
            "phone",
            "message",
            "gdpr_consent",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            "partner_role": {"error_messages": {"invalid_choice": "Vyberte svoju profesijnú rolu."}},
        }

    def validate_contact_name(self, value: str) -> str:
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Zadajte meno kontaktnej osoby.")
        return value

    def validate_phone(self, value: str) -> str:
        if not value or not value.strip():
            return ""
        return validate_phone_number(value)

    def validate_message(self, value: str) -> str:
        value = value.strip()
        if len(value) < 20:
            raise serializers.ValidationError("Napíšte nám prosím aspoň pár viet o vašom projekte (min. 20 znakov).")
        return value

    def validate_gdpr_consent(self, value: bool) -> bool:
        if not value:
            raise serializers.ValidationError("Pre odoslanie je potrebný súhlas so spracovaním údajov.")
        return value
