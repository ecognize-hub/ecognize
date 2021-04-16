from .models import UserType


def is_non_profit_employee(user):
    return user.profile.type in [UserType.LAW.value, UserType.NGO.value, UserType.ACA.value, UserType.JRN.value]


def is_volunteer(user):
    return user.profile.type == UserType.VOL.value


def is_anonymous_contributor(user):
    return user.profile.type == UserType.ANO.value


def is_commercial_entity_employee(user):
    return user.profile.type == UserType.COM.value
