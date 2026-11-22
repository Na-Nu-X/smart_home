"""Domain models for the smart home integrator website."""

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.text import slugify


def unique_slugify(instance: models.Model, value: str, slug_field: str = "slug", max_length: int = 220) -> str:
    """Return a slug derived from ``value`` that is unique for the model."""
    base = slugify(value, allow_unicode=False)[:max_length].strip("-") or "polozka"
    slug = base
    model = type(instance)
    counter = 2
    while model.objects.filter(**{slug_field: slug}).exclude(pk=instance.pk).exists():
        suffix = f"-{counter}"
        slug = f"{base[: max_length - len(suffix)]}{suffix}"
        counter += 1
    return slug


class SluggedModel(models.Model):
    """Abstract base that auto-generates a unique slug from a source field."""

    slug_source_field = "name"

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = unique_slugify(self, getattr(self, self.slug_source_field))
        super().save(*args, **kwargs)


class PropertyType(models.TextChoices):
    """Property types used for reference installations."""

    RODINNY_DOM = "rodinny_dom", "Rodinný dom / Vila"
    BYT_PENTHOUSE = "byt_penthouse", "Byt / Penthouse"
    KOMERCNY_OBJEKT = "komercny_objekt", "Komerčný objekt / Kancelárie"


class SolutionDomain(SluggedModel):
    name = models.CharField("názov", max_length=160)
    slug = models.SlugField("slug (URL)", max_length=180, unique=True, blank=True)
    short_summary = models.TextField("krátky popis", blank=True)
    icon_name = models.CharField(
        "ikona",
        max_length=60,
        blank=True,
        help_text="Identifikátor ikony vo frontende (napr. lighting, shading, climate, energy, security, audio).",
    )
    display_order = models.PositiveIntegerField("poradie zobrazenia", default=0)

    class Meta:
        verbose_name = "oblasť automatizácie"
        verbose_name_plural = "oblasti automatizácie"
        ordering = ["display_order", "name"]

    def __str__(self) -> str:
        return self.name


class SmartSolution(SluggedModel):
    domain = models.ForeignKey(
        SolutionDomain,
        verbose_name="oblasť automatizácie",
        on_delete=models.PROTECT,
        related_name="solutions",
    )
    name = models.CharField("názov riešenia", max_length=200)
    slug = models.SlugField("slug (URL)", max_length=220, unique=True, blank=True)
    short_description = models.TextField("krátky popis")
    detailed_description = models.TextField("podrobný popis", blank=True)
    everyday_benefits = models.JSONField(
        "prínosy v bežnom dni", default=list, blank=True, help_text="Zoznam textov (JSON pole reťazcov)."
    )
    supported_protocols = models.JSONField(
        "podporované protokoly", default=list, blank=True, help_text='Napr. ["Loxone Tree / Air", "KNX", "DALI-2"].'
    )
    energy_saving_note = models.CharField("poznámka k úspore energie", max_length=240, blank=True)
    starting_price_eur = models.DecimalField(
        "cena od (EUR)", max_digits=10, decimal_places=2, null=True, blank=True
    )
    cover_image_url = models.URLField("URL titulnej fotografie", max_length=500, blank=True)
    is_featured = models.BooleanField("odporúčané", default=False)
    created_at = models.DateTimeField("vytvorené", auto_now_add=True)
    updated_at = models.DateTimeField("upravené", auto_now=True)

    class Meta:
        verbose_name = "funkčné riešenie"
        verbose_name_plural = "funkčné riešenia a technológie"
        ordering = ["domain__display_order", "name"]

    def __str__(self) -> str:
        return self.name


class ReferenceInstallation(SluggedModel):
    slug_source_field = "title"

    title = models.CharField("názov projektu", max_length=220)
    slug = models.SlugField("slug (URL)", max_length=240, unique=True, blank=True)
    property_type = models.CharField("typ nehnuteľnosti", max_length=20, choices=PropertyType.choices)
    location_city = models.CharField("mesto / lokalita", max_length=120)
    floor_area_sqm = models.PositiveIntegerField("úžitková plocha (m²)", validators=[MinValueValidator(1)])
    system_platform = models.CharField("systémová platforma", max_length=160)
    client_vision = models.TextField("vízia klienta", blank=True)
    implemented_features = models.JSONField(
        "realizované funkcie", default=list, blank=True, help_text="Zoznam textov (JSON pole reťazcov)."
    )
    measured_benefit = models.CharField("nameraný prínos", max_length=240, blank=True)
    cover_image_url = models.URLField("URL titulnej fotografie", max_length=500, blank=True)
    completion_year = models.PositiveIntegerField("rok dokončenia", null=True, blank=True)
    is_featured = models.BooleanField("vybraná realizácia", default=False)
    display_order = models.PositiveIntegerField("poradie zobrazenia", default=0)
    created_at = models.DateTimeField("vytvorené", auto_now_add=True)

    class Meta:
        verbose_name = "realizácia"
        verbose_name_plural = "realizácie a referenčné projekty"
        ordering = ["display_order", "-created_at"]

    def __str__(self) -> str:
        return self.title


class ReferencePhoto(models.Model):
    reference = models.ForeignKey(
        ReferenceInstallation, verbose_name="realizácia", on_delete=models.CASCADE, related_name="photos"
    )
    image_url = models.URLField("URL fotografie", max_length=500)
    caption = models.CharField("popis", max_length=200, blank=True)
    display_order = models.PositiveIntegerField("poradie", default=0)

    class Meta:
        verbose_name = "fotografia realizácie"
        verbose_name_plural = "fotografie realizácie"
        ordering = ["display_order", "id"]

    def __str__(self) -> str:
        return self.caption or f"Fotografia #{self.pk}"


class SmartHomeConsultationRequest(models.Model):
    class InquiryGoal(models.TextChoices):
        CENOVA_PONUKA = "cenova_ponuka", "Nezáväzná cenová ponuka a projekt"
        NAVSTEVA_SHOWROOMU = "navsteva_showroomu", "Osobná návšteva a ukážka v showroome"
        KONZULTACIA_PROJEKTU = "konzultacia_projektu", "Konzultácia k rozpracovanému projektu elektroinštalácie"

    class ConsultationPropertyType(models.TextChoices):
        RODINNY_DOM = "rodinny_dom", "Rodinný dom"
        BYT = "byt", "Byt / Apartmán"
        KOMERCNY = "komercny", "Komerčný objekt"

    class ConstructionStage(models.TextChoices):
        PROJEKT = "projekt", "Ešte len pripravujeme projekt"
        HRUBA_STAVBA = "hruba_stavba", "Hrubá stavba (pred ťahaním káblov)"
        REKONSTRUKCIA = "rekonstrukcia", "Kompletná rekonštrukcia"
        HOTOVY_DOM = "hotovy_dom", "Hotový dom / Byt (bezdrôtové riešenie)"

    class Status(models.TextChoices):
        NOVY = "novy", "Nový"
        KONZULTOVANY = "konzultovany", "Konzultovaný"
        PONUKA_ODOSLANA = "ponuka_odoslana", "Ponuka odoslaná"
        REALIZACIA = "realizacia", "V realizácii"

    inquiry_goal = models.CharField("cieľ dopytu", max_length=30, choices=InquiryGoal.choices)
    property_type = models.CharField("typ nehnuteľnosti", max_length=20, choices=ConsultationPropertyType.choices)
    construction_stage = models.CharField("fáza stavby", max_length=20, choices=ConstructionStage.choices)
    floor_area_sqm = models.PositiveIntegerField(
        "úžitková plocha (m²)",
        null=True,
        blank=True,
        validators=[MinValueValidator(10), MaxValueValidator(20000)],
    )
    selected_modules = models.JSONField("vybrané moduly", default=list, blank=True)
    floorplan_file = models.FileField(
        "pôdorys / projekt", upload_to="consultations/floorplans/", blank=True, null=True
    )
    location_city = models.CharField("lokalita stavby", max_length=120)
    client_name = models.CharField("meno a priezvisko", max_length=160)
    email = models.EmailField("e-mail")
    phone = models.CharField("telefón", max_length=40)
    notes = models.TextField("poznámka", blank=True)
    estimated_budget = models.CharField(
        "orientačný rozpočet z kalkulačky", max_length=80, blank=True
    )
    gdpr_consent = models.BooleanField("súhlas so spracovaním osobných údajov", default=False)
    status = models.CharField("stav", max_length=20, choices=Status.choices, default=Status.NOVY)
    internal_note = models.TextField("interná poznámka", blank=True)
    created_at = models.DateTimeField("prijaté", auto_now_add=True)

    class Meta:
        verbose_name = "dopyt na smart home riešenie"
        verbose_name_plural = "dopyty na smart home riešenie"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.client_name} – {self.get_inquiry_goal_display()}"


class ArchitectPartnerInquiry(models.Model):
    class PartnerRole(models.TextChoices):
        ARCHITEKT = "architekt", "Architekt / Interiérový dizajnér"
        ELEKTRO_PROJEKTANT = "elektro_projektant", "Projektant elektroinštalácií"
        DEVELOPER = "developer", "Developer rezidenčných projektov"

    partner_role = models.CharField("rola partnera", max_length=30, choices=PartnerRole.choices)
    studio_or_company_name = models.CharField("štúdio / spoločnosť", max_length=200)
    contact_name = models.CharField("kontaktná osoba", max_length=160)
    email = models.EmailField("e-mail")
    phone = models.CharField("telefón", max_length=40, blank=True)
    message = models.TextField("správa")
    gdpr_consent = models.BooleanField("súhlas so spracovaním osobných údajov", default=False)
    is_processed = models.BooleanField("vybavené", default=False)
    created_at = models.DateTimeField("prijaté", auto_now_add=True)

    class Meta:
        verbose_name = "B2B dopyt partnera"
        verbose_name_plural = "B2B spolupráca (architekti a developeri)"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.studio_or_company_name} – {self.contact_name}"
