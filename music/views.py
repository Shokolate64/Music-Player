from django.shortcuts import render, redirect, get_object_or_404
from .forms import SongForm, PlaylistForm
from .models import Playlist, Song
from django.http import FileResponse, HttpResponse, JsonResponse
from django.conf import settings
import os
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

def serve_audio_file(request, path):
    file_path = os.path.join(settings.MEDIA_ROOT, path)

    if not os.path.exists(file_path):
        return HttpResponse("File not found", status=404)

    range_header = request.headers.get('Range', None)
    if range_header:
        start, end = range_header.replace("bytes=", "").split("-")
        start = int(start)
        end = int(end) if end else os.path.getsize(file_path) - 1

        with open(file_path, 'rb') as f:
            f.seek(start)
            data = f.read(end - start + 1)

        response = HttpResponse(data, status=206, content_type="audio/mpeg")
        response["Content-Range"] = f"bytes {start}-{end}/{os.path.getsize(file_path)}"
        response["Accept-Ranges"] = "bytes"
        return response

    return FileResponse(open(file_path, 'rb'), content_type="audio/mpeg")

def upload_song(request):
    if request.method == 'POST':
        form = SongForm(request.POST, request.FILES)
        if form.is_valid():
            song = form.save()
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                # Retorna información de la canción subida para actualizar dinámicamente
                return JsonResponse({
                    'message': 'Song uploaded successfully!',
                    'song': {
                        'id': song.id,
                        'title': song.title,
                        'artist': song.artist,
                        'album': song.album or '',
                        'cover': song.cover.url if song.cover else '/static/music/default_cover.png',
                        'audio_file': song.audio_file.url,
                    }
                })
            return redirect('song_list')  # Para solicitudes normales, redirige a la lista de canciones
    else:
        form = SongForm()
    return render(request, 'music/upload_song.html', {'form': form})

def song_list(request):
    songs = Song.objects.all()
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':  # Verifica si es una solicitud AJAX
        return render(request, 'music/song_list.html', {'songs': songs})
    return render(request, 'music/base.html', {'songs': songs})

def list_playlists(request):
    playlists = Playlist.objects.all()
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return render(request, 'music/list_playlists.html', {'playlists': playlists})
    return render(request, 'music/base.html', {'view': 'list_playlists'})


def view_playlist(request, playlist_id):
    playlist = get_object_or_404(Playlist, id=playlist_id)
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return render(request, 'music/view_playlist.html', {'playlist': playlist})
    return render(request, 'music/base.html', {'view': 'view_playlist', 'playlist': playlist})


def create_playlist(request):
    if request.method == 'POST':
        form = PlaylistForm(request.POST)
        if form.is_valid():
            form.save()
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'message': 'Playlist created successfully'})
            return redirect('list_playlists')
    else:
        form = PlaylistForm()
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return render(request, 'music/create_playlist.html', {'form': form})
    return render(request, 'music/base.html', {'view': 'create_playlist', 'form': form})

@csrf_exempt  # Elimina esto si CSRF está correctamente configurado
def add_to_playlist(request):
    if request.method == "POST":
        import json
        data = json.loads(request.body)
        playlist_id = data.get("playlist_id")
        song_id = data.get("song_id")

        playlist = get_object_or_404(Playlist, id=playlist_id)
        song = get_object_or_404(Song, id=song_id)

        playlist.songs.add(song)
        return JsonResponse({"message": "Song added successfully!"})
    return JsonResponse({"error": "Invalid request"}, status=400)

def get_playlists(request):
    playlists = Playlist.objects.all()
    data = [{"id": p.id, "name": p.name} for p in playlists]
    return JsonResponse({"playlists": data})

def favorite_songs(request):
    print("Request Headers:", request.headers)
    print("Is AJAX:", request.headers.get("X-Requested-With") == "XMLHttpRequest")
    
    favorites = Song.objects.filter(is_favorite=True)

    if request.headers.get("X-Requested-With") == "XMLHttpRequest":
        print("Returning AJAX response")
        return render(request, "music/favorite_songs.html", {"songs": favorites})
    
    print("Returning full page response")
    return render(request, "music/base.html", {"songs": favorites})



@csrf_exempt
def toggle_favorite(request, song_id):
    if request.method == "POST":
        try:
            song = Song.objects.get(id=song_id)
            song.is_favorite = not song.is_favorite
            song.save()
            return JsonResponse({"success": True, "is_favorite": song.is_favorite})
        except Song.DoesNotExist:
            return JsonResponse({"success": False, "error": "Song not found"}, status=404)
    return JsonResponse({"success": False, "error": "Invalid request"}, status=400)

@csrf_exempt
def delete_playlist(request, playlist_id):
    if request.method == "POST":
        try:
            playlist = Playlist.objects.get(id=playlist_id)
            playlist.delete()
            return JsonResponse({"success": True})
        except Playlist.DoesNotExist:
            return JsonResponse({"success": False, "error": "Playlist not found"}, status=404)
    return JsonResponse({"success": False, "error": "Invalid request"}, status=400)

@csrf_exempt
def remove_song_from_playlist(request, playlist_id, song_id):
    if request.method == "POST":
        try:
            playlist = Playlist.objects.get(id=playlist_id)
            song = playlist.songs.get(id=song_id)
            playlist.songs.remove(song)
            return JsonResponse({"success": True})
        except Playlist.DoesNotExist:
            return JsonResponse({"success": False, "error": "Playlist not found"}, status=404)
        except Song.DoesNotExist:
            return JsonResponse({"success": False, "error": "Song not found in playlist"}, status=404)
    return JsonResponse({"success": False, "error": "Invalid request"}, status=400)

def get_playlist_songs(request, playlist_id):
    try:
        playlist = Playlist.objects.get(id=playlist_id)
        songs = playlist.songs.all()
        song_list = [
            {
                "id": song.id,
                "title": song.title,
                "artist": song.artist,
                "in_playlist": True,
            }
            for song in songs
        ]
        return JsonResponse({"songs": song_list})
    except Playlist.DoesNotExist:
        return JsonResponse({"error": "Playlist not found"}, status=404)

