from django.contrib import admin
from django.contrib.gis import admin
from .models import Report, OnlineReport, ReportImage, ReportComment, OnlineReportComment, ReportCommentThread, OnlineReportCommentThread
from leaflet.admin import LeafletGeoAdminMixin


class ReportAdmin(LeafletGeoAdminMixin, admin.ModelAdmin):
    pass


admin.site.register(Report, admin.GeoModelAdmin)
admin.site.register(OnlineReport)
admin.site.register(ReportImage)
admin.site.register(ReportComment)
admin.site.register(ReportCommentThread)
admin.site.register(OnlineReportComment)
admin.site.register(OnlineReportCommentThread)
