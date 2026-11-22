from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("domains", views.SolutionDomainViewSet, basename="domain")
router.register("solutions", views.SmartSolutionViewSet, basename="solution")
router.register("references", views.ReferenceInstallationViewSet, basename="reference")
router.register("consultations", views.ConsultationRequestViewSet, basename="consultation")
router.register("partners", views.PartnerInquiryViewSet, basename="partner")

urlpatterns = router.urls
