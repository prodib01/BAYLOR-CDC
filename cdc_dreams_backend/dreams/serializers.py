from rest_framework import serializers
from .models import Facilitator, Event, AgeGroup, Participant, Material, MaterialEvent, ParticipantEventAttendance


class FacilitatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Facilitator
        fields = '__all__'


class AgeGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgeGroup
        fields = '__all__'


class ParticipantSerializer(serializers.ModelSerializer):
    age_group_details = AgeGroupSerializer(
        source='age_group', read_only=True)

    class Meta:
        model = Participant
        fields = ['id', 'name', 'age_group', 'village', 'has_hiv',
                  'is_in_school', 'dob', 'enrollment_date', 'age_group_details',]


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'


class ParticipantEventAttendanceSerializer(serializers.ModelSerializer):
    participant_details = ParticipantSerializer(
        source='participant', read_only=True)
    # event_details = EventSerializer(source='event', read_only=True)

    class Meta:
        model = ParticipantEventAttendance
        fields = ['id', 'participant', 'event',
                  'participant_details', 'skills', 'lessons_attended', 'finished_program', 'self_sufficient',]


class EventSerializer(serializers.ModelSerializer):
    facilitators_details = FacilitatorSerializer(
        source='facilitators', many=True, read_only=True)
    event_attendances = ParticipantEventAttendanceSerializer(
        source='participanteventattendance_set', many=True, read_only=True)

    class Meta:
        model = Event
        fields = ['id', 'name', 'event_type', 'start_date', 'end_date',
                  'location', 'facilitators', 'lessons', 'learning_outcomes', 'facilitators_details', 'event_attendances',]


class MaterialEventSerializer(serializers.ModelSerializer):
    material_details = MaterialSerializer(source='material', read_only=True)
    event_details = EventSerializer(source='event', read_only=True)

    class Meta:
        model = MaterialEvent
        fields = ['id', 'material', 'event', 'quantity',
                  'material_details', 'event_details',]
