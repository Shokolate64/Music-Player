from django.db import models
from mutagen.mp3 import MP3

class Song(models.Model):
    title = models.CharField(max_length=100)
    artist = models.CharField(max_length=100)
    album = models.CharField(max_length=100, blank=True, null=True)
    cover = models.ImageField(upload_to='covers/', blank=True, null=True)
    audio_file = models.FileField(upload_to='audios/')
    is_favorite = models.BooleanField(default=False)
    
    def save(self, *args, **kwargs):
        if self.audio_file:
            audio = MP3(self.audio_file)
            self.duration = audio.info.length  # Calcula la duración
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} by {self.artist}"
        
class Playlist(models.Model):
    name = models.CharField(max_length=100)
    songs = models.ManyToManyField('Song', related_name='playlists')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
    