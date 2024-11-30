from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.upload_song, name='upload_song'),
    path('', views.song_list, name='song_list'),
    path('playlists/', views.list_playlists, name='list_playlists'),
    path('playlists/create/', views.create_playlist, name='create_playlist'),
    path('playlists/<int:playlist_id>/', views.view_playlist, name='view_playlist'),
    path("playlists/add/", views.add_to_playlist, name="add_to_playlist"),
    path("playlists/json/", views.get_playlists, name="get_playlists"),
    path("favorites/", views.favorite_songs, name="favorite_songs"),
    path("songs/<int:song_id>/toggle-favorite/", views.toggle_favorite, name="toggle_favorite"),
    path("playlists/<int:playlist_id>/songs/", views.get_playlist_songs, name="get_playlist_songs"),
    path("playlists/<int:playlist_id>/remove-song/<int:song_id>/", views.remove_song_from_playlist, name="remove_song_from_playlist"),
    path("playlists/<int:playlist_id>/delete/", views.delete_playlist, name="delete_playlist"),
    
]
