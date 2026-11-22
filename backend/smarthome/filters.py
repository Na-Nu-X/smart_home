"""django-filter FilterSets for the public catalogue."""

import django_filters

from .models import PropertyType, ReferenceInstallation, SmartSolution


class SmartSolutionFilter(django_filters.FilterSet):
    domain = django_filters.CharFilter(field_name="domain__slug", label="Oblasť (slug)")
    featured = django_filters.BooleanFilter(field_name="is_featured", label="Odporúčané")
    protocol = django_filters.CharFilter(method="filter_protocol", label="Protokol")

    class Meta:
        model = SmartSolution
        fields = ["domain", "featured", "protocol"]

    def filter_protocol(self, queryset, name, value):
        # JSON containment lookups are not supported on SQLite; a text match on the
        # serialized list works on every backend.
        return queryset.filter(supported_protocols__icontains=value)


class ReferenceInstallationFilter(django_filters.FilterSet):
    property_type = django_filters.ChoiceFilter(choices=PropertyType.choices, label="Typ nehnuteľnosti")
    featured = django_filters.BooleanFilter(field_name="is_featured", label="Vybrané")
    city = django_filters.CharFilter(field_name="location_city", lookup_expr="iexact", label="Mesto")

    class Meta:
        model = ReferenceInstallation
        fields = ["property_type", "featured", "city"]
