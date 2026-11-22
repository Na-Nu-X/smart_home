"""Root URL configuration."""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

admin.site.site_header = "Smart Home Studio – administrácia"
admin.site.site_title = "Smart Home administrácia"
admin.site.index_title = "Správa obsahu a dopytov"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("smarthome.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
