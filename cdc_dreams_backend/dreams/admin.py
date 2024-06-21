from django.contrib import admin
from .models import Facilitator, Event, AgeGroup, Participant, Material, MaterialEvent, ParticipantEventAttendance

admin.site.register(Facilitator)
admin.site.register(Event)
admin.site.register(AgeGroup)
admin.site.register(Participant)
admin.site.register(Material)
admin.site.register(MaterialEvent)
admin.site.register(ParticipantEventAttendance)
