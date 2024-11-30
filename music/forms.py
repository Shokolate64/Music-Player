from django import forms
from .models import Song, Playlist

class SongForm(forms.ModelForm):
    class Meta:
        model = Song
        fields = ['title', 'artist', 'album', 'cover', 'audio_file']

class PlaylistForm(forms.ModelForm):
    class Meta:
        model = Playlist
        fields = ['name']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Playlist Name'}),
        }