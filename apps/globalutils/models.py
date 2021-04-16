from django.db import models


class ThankableMixin(models.Model):
    thanks = models.IntegerField(default=0)
    author = models.ForeignKey('profiles.UserProfile', on_delete=models.CASCADE)
    thanked_by = models.ManyToManyField('profiles.UserProfile', blank=True)

    class Meta:
        abstract = True
