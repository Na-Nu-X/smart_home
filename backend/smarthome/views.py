"""Public REST API views."""

from django.db.models import Count
from rest_framework import mixins, status, viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from .filters import ReferenceInstallationFilter, SmartSolutionFilter
from .models import (
    ArchitectPartnerInquiry,
    ReferenceInstallation,
    SmartHomeConsultationRequest,
    SmartSolution,
    SolutionDomain,
)
from .serializers import (
    ArchitectPartnerInquirySerializer,
    ReferenceDetailSerializer,
    ReferenceListSerializer,
    SmartHomeConsultationRequestSerializer,
    SmartSolutionDetailSerializer,
    SmartSolutionListSerializer,
    SolutionDomainSerializer,
)


class SolutionDomainViewSet(viewsets.ReadOnlyModelViewSet):
    """Smart home automation domains with the number of solutions in each."""

    serializer_class = SolutionDomainSerializer
    lookup_field = "slug"
    pagination_class = None
    filter_backends = []
    queryset = SolutionDomain.objects.annotate(solution_count=Count("solutions")).order_by("display_order", "name")


class SmartSolutionViewSet(viewsets.ReadOnlyModelViewSet):
    """Functional smart home solutions (filter: domain, featured, protocol; search; ordering)."""

    lookup_field = "slug"
    pagination_class = None
    filterset_class = SmartSolutionFilter
    search_fields = ["name", "short_description", "supported_protocols", "domain__name"]
    ordering_fields = ["name", "starting_price_eur", "created_at", "domain__display_order"]
    ordering = ["domain__display_order", "name"]
    queryset = SmartSolution.objects.select_related("domain")

    def get_serializer_class(self):
        return SmartSolutionDetailSerializer if self.action == "retrieve" else SmartSolutionListSerializer


class ReferenceInstallationViewSet(viewsets.ReadOnlyModelViewSet):
    """Completed reference installations (filter: property_type, featured, city; search)."""

    lookup_field = "slug"
    pagination_class = None
    filterset_class = ReferenceInstallationFilter
    search_fields = ["title", "location_city", "system_platform", "client_vision"]
    ordering_fields = ["display_order", "floor_area_sqm", "completion_year", "created_at"]
    ordering = ["display_order", "-created_at"]
    queryset = ReferenceInstallation.objects.prefetch_related("photos")

    def get_serializer_class(self):
        return ReferenceDetailSerializer if self.action == "retrieve" else ReferenceListSerializer


class LeadCreateViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """Base for anonymous, write-only lead submission endpoints."""

    throttle_scope = "lead_submission"
    filter_backends = []
    success_message = ""

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"id": serializer.instance.pk, "message": self.success_message},
            status=status.HTTP_201_CREATED,
        )


class ConsultationRequestViewSet(LeadCreateViewSet):
    """Homeowner quote / showroom visit request. Accepts JSON or multipart (floor plan upload)."""

    serializer_class = SmartHomeConsultationRequestSerializer
    queryset = SmartHomeConsultationRequest.objects.none()
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    success_message = "Ďakujeme, váš dopyt sme prijali. Ozveme sa vám do 24 hodín v pracovných dňoch."


class PartnerInquiryViewSet(LeadCreateViewSet):
    """B2B collaboration inquiry from architects, designers and developers."""

    serializer_class = ArchitectPartnerInquirySerializer
    queryset = ArchitectPartnerInquiry.objects.none()
    success_message = "Ďakujeme za záujem o spoluprácu. Náš B2B konzultant vás bude kontaktovať."
