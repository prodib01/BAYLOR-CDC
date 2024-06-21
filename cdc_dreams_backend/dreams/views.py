from rest_framework import viewsets
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response

from .models import Facilitator, Event, AgeGroup, Participant, Material, MaterialEvent, ParticipantEventAttendance
from .serializers import FacilitatorSerializer, EventSerializer, AgeGroupSerializer, ParticipantSerializer, MaterialSerializer, MaterialEventSerializer, ParticipantEventAttendanceSerializer


class FacilitatorViewSet(viewsets.ModelViewSet):
    queryset = Facilitator.objects.all()
    serializer_class = FacilitatorSerializer


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer


class AgeGroupViewSet(viewsets.ModelViewSet):
    queryset = AgeGroup.objects.all()
    serializer_class = AgeGroupSerializer


class ParticipantViewSet(viewsets.ModelViewSet):
    queryset = Participant.objects.all()
    serializer_class = ParticipantSerializer


class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer


class MaterialEventViewSet(viewsets.ModelViewSet):
    queryset = MaterialEvent.objects.all()
    serializer_class = MaterialEventSerializer


class ParticipantEventAttendanceViewSet(viewsets.ModelViewSet):
    queryset = ParticipantEventAttendance.objects.all()
    serializer_class = ParticipantEventAttendanceSerializer


class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        response = super(CustomAuthToken, self).post(request, *args, **kwargs)
        token = Token.objects.get(key=response.data['token'])
        user = token.user
        return Response({
            'token': token.key,
            'user_id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
        })
