from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from music.views import serve_audio_file

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('music.urls')),  # Redirige a la app
    path('media/<path:path>', serve_audio_file, name='serve_audio_file'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
