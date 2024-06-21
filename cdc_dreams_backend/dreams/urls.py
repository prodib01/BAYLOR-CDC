from rest_framework import routers
from django.urls import path, include
from .views import FacilitatorViewSet, EventViewSet, AgeGroupViewSet, ParticipantViewSet, MaterialViewSet, MaterialEventViewSet, ParticipantEventAttendanceViewSet, CustomAuthToken

router = routers.DefaultRouter()
router.register(r'facilitators', FacilitatorViewSet)
router.register(r'events', EventViewSet)
router.register(r'agegroups', AgeGroupViewSet)
router.register(r'participants', ParticipantViewSet)
router.register(r'materials', MaterialViewSet)
router.register(r'materialevents', MaterialEventViewSet)
router.register(r'participantattendances', ParticipantEventAttendanceViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', CustomAuthToken.as_view(), name='login'),
]
