from django.db import models


class Facilitator(models.Model):
    name = models.CharField(max_length=100)
    dob = models.DateField()
    gender = models.CharField(max_length=10)
    facilitates = models.CharField(max_length=255)
    contact = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.name


class Event(models.Model):
    name = models.CharField(max_length=100)
    event_type = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    location = models.CharField(max_length=255)
    facilitators = models.ManyToManyField(Facilitator)
    lessons = models.TextField()
    learning_outcomes = models.TextField()

    def __str__(self):
        return self.name + ' - ' + self.event_type


class AgeGroup(models.Model):
    group = models.CharField(max_length=10)

    def __str__(self):
        return self.group


class Participant(models.Model):
    name = models.CharField(max_length=100)
    age_group = models.ForeignKey(AgeGroup, on_delete=models.CASCADE)
    village = models.CharField(max_length=100)
    has_hiv = models.BooleanField()
    is_in_school = models.BooleanField(default=False)
    dob = models.DateField()
    enrollment_date = models.DateField()

    def __str__(self):
        return self.name


class Material(models.Model):
    name = models.CharField(max_length=100)
    stock = models.IntegerField()
    target_group = models.ForeignKey(AgeGroup, on_delete=models.CASCADE)

    def __str__(self):
        return self.name + ' - ' + str(self.stock)


class MaterialEvent(models.Model):
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    quantity = models.IntegerField()

    def __str__(self):
        return self.material.name + ' - ' + self.event.name + ' - ' + str(self.quantity)
    
    def save(self, *args, **kwargs):
        if self.quantity > self.material.stock:
            raise Exception('Not enough stock')
        else:
            self.material.stock -= self.quantity
            self.material.save()
            super(MaterialEvent, self).save(*args, **kwargs)
            


class ParticipantEventAttendance(models.Model):
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    skills = models.TextField()
    lessons_attended = models.IntegerField(default=0)
    finished_program = models.BooleanField(default=False)
    self_sufficient = models.BooleanField(default=False)

    def __str__(self):
        return self.participant.name + ' - ' + self.event.name
