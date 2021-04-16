from django.contrib.gis.forms import BaseGeometryWidget


class MapBoxWidget(BaseGeometryWidget):
    template_name = 'mapbox_widget.html'
    map_srid = 4326

    def serialize(self, value):
        return value.json if value else ''

    def deserialize(self, value):
        geom = super().deserialize(value)
        # GeoJSON assumes WGS84 (4326). Use the map's SRID instead.
        return geom
