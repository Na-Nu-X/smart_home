"""Django admin configuration (Slovak UI for project managers and system architects)."""

from django.contrib import admin
from django.db.models import Count
from django.utils.html import format_html

from .constants import SMART_MODULES
from .models import (
    ArchitectPartnerInquiry,
    ReferenceInstallation,
    ReferencePhoto,
    SmartHomeConsultationRequest,
    SmartSolution,
    SolutionDomain,
)


def image_preview(url: str, height: int = 56):
    if not url:
        return "—"
    return format_html(
        '<img src="{}" style="height:{}px;width:auto;border-radius:6px;object-fit:cover" alt="">', url, height
    )


class SmartSolutionInline(admin.TabularInline):
    model = SmartSolution
    fields = ["name", "is_featured", "starting_price_eur"]
    extra = 0
    show_change_link = True


@admin.register(SolutionDomain)
class SolutionDomainAdmin(admin.ModelAdmin):
    list_display = ["name", "icon_name", "display_order", "solution_count"]
    list_editable = ["display_order"]
    search_fields = ["name", "short_summary"]
    prepopulated_fields = {"slug": ["name"]}
    inlines = [SmartSolutionInline]

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(_solution_count=Count("solutions"))

    @admin.display(description="počet riešení", ordering="_solution_count")
    def solution_count(self, obj):
        return obj._solution_count


@admin.register(SmartSolution)
class SmartSolutionAdmin(admin.ModelAdmin):
    list_display = ["thumbnail", "name", "domain", "starting_price_eur", "is_featured", "updated_at"]
    list_display_links = ["thumbnail", "name"]
    list_editable = ["is_featured"]
    list_filter = ["domain", "is_featured"]
    search_fields = ["name", "short_description", "detailed_description"]
    prepopulated_fields = {"slug": ["name"]}
    readonly_fields = ["cover_preview", "created_at", "updated_at"]
    fieldsets = [
        ("Základné údaje", {"fields": ["domain", "name", "slug", "is_featured", "starting_price_eur"]}),
        ("Popis", {"fields": ["short_description", "detailed_description", "everyday_benefits"]}),
        ("Technológie a úspory", {"fields": ["supported_protocols", "energy_saving_note"]}),
        ("Fotografia", {"fields": ["cover_image_url", "cover_preview"]}),
        ("Systémové údaje", {"fields": ["created_at", "updated_at"], "classes": ["collapse"]}),
    ]

    @admin.display(description="foto")
    def thumbnail(self, obj):
        return image_preview(obj.cover_image_url, 40)

    @admin.display(description="náhľad")
    def cover_preview(self, obj):
        return image_preview(obj.cover_image_url, 180)


class ReferencePhotoInline(admin.TabularInline):
    model = ReferencePhoto
    fields = ["preview", "image_url", "caption", "display_order"]
    readonly_fields = ["preview"]
    extra = 1

    @admin.display(description="náhľad")
    def preview(self, obj):
        return image_preview(obj.image_url, 48)


@admin.register(ReferenceInstallation)
class ReferenceInstallationAdmin(admin.ModelAdmin):
    list_display = [
        "thumbnail",
        "title",
        "property_type",
        "location_city",
        "floor_area_sqm",
        "system_platform",
        "is_featured",
        "display_order",
    ]
    list_display_links = ["thumbnail", "title"]
    list_editable = ["is_featured", "display_order"]
    list_filter = ["property_type", "is_featured", "location_city"]
    search_fields = ["title", "location_city", "system_platform", "client_vision"]
    prepopulated_fields = {"slug": ["title"]}
    readonly_fields = ["cover_preview"]
    inlines = [ReferencePhotoInline]
    fieldsets = [
        (
            "Projekt",
            {"fields": ["title", "slug", "property_type", "location_city", "floor_area_sqm", "completion_year"]},
        ),
        ("Technické riešenie", {"fields": ["system_platform", "implemented_features", "measured_benefit"]}),
        ("Príbeh klienta", {"fields": ["client_vision"]}),
        ("Zobrazenie", {"fields": ["cover_image_url", "cover_preview", "is_featured", "display_order"]}),
    ]

    @admin.display(description="foto")
    def thumbnail(self, obj):
        return image_preview(obj.cover_image_url, 40)

    @admin.display(description="náhľad")
    def cover_preview(self, obj):
        return image_preview(obj.cover_image_url, 180)


@admin.register(SmartHomeConsultationRequest)
class SmartHomeConsultationRequestAdmin(admin.ModelAdmin):
    list_display = [
        "created_at",
        "client_name",
        "inquiry_goal",
        "property_type",
        "construction_stage",
        "floor_area_sqm",
        "location_city",
        "has_floorplan",
        "status",
    ]
    list_display_links = ["created_at", "client_name"]
    list_editable = ["status"]
    list_filter = ["status", "inquiry_goal", "property_type", "construction_stage", "created_at"]
    search_fields = ["client_name", "email", "phone", "location_city", "notes"]
    date_hierarchy = "created_at"
    readonly_fields = ["created_at", "modules_display", "floorplan_link", "gdpr_consent", "estimated_budget"]
    actions = ["mark_consulted", "mark_offer_sent"]
    fieldsets = [
        ("Stav spracovania", {"fields": ["status", "internal_note", "created_at"]}),
        ("Klient", {"fields": ["client_name", "email", "phone", "location_city", "gdpr_consent"]}),
        (
            "Projekt",
            {
                "fields": [
                    "inquiry_goal",
                    "property_type",
                    "construction_stage",
                    "floor_area_sqm",
                    "selected_modules",
                    "modules_display",
                    "estimated_budget",
                    "floorplan_file",
                    "floorplan_link",
                    "notes",
                ]
            },
        ),
    ]

    @admin.display(description="pôdorys", boolean=True)
    def has_floorplan(self, obj):
        return bool(obj.floorplan_file)

    @admin.display(description="moduly (čitateľne)")
    def modules_display(self, obj):
        return ", ".join(SMART_MODULES.get(key, key) for key in obj.selected_modules or []) or "—"

    @admin.display(description="stiahnuť pôdorys")
    def floorplan_link(self, obj):
        if not obj.floorplan_file:
            return "—"
        return format_html('<a href="{}" target="_blank" rel="noopener">Otvoriť súbor</a>', obj.floorplan_file.url)

    @admin.action(description="Označiť ako konzultované")
    def mark_consulted(self, request, queryset):
        updated = queryset.update(status=SmartHomeConsultationRequest.Status.KONZULTOVANY)
        self.message_user(request, f"Aktualizovaných dopytov: {updated}.")

    @admin.action(description="Označiť ako „ponuka odoslaná“")
    def mark_offer_sent(self, request, queryset):
        updated = queryset.update(status=SmartHomeConsultationRequest.Status.PONUKA_ODOSLANA)
        self.message_user(request, f"Aktualizovaných dopytov: {updated}.")


@admin.register(ArchitectPartnerInquiry)
class ArchitectPartnerInquiryAdmin(admin.ModelAdmin):
    list_display = ["created_at", "studio_or_company_name", "contact_name", "partner_role", "email", "is_processed"]
    list_display_links = ["created_at", "studio_or_company_name"]
    list_editable = ["is_processed"]
    list_filter = ["partner_role", "is_processed", "created_at"]
    search_fields = ["studio_or_company_name", "contact_name", "email", "message"]
    date_hierarchy = "created_at"
    readonly_fields = ["created_at", "gdpr_consent"]
    actions = ["mark_processed"]

    @admin.action(description="Označiť ako vybavené")
    def mark_processed(self, request, queryset):
        updated = queryset.update(is_processed=True)
        self.message_user(request, f"Vybavených dopytov: {updated}.")
