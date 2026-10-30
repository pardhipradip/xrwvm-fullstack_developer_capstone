# Uncomment the imports before you add the code
from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from . import views

app_name = 'djangoapp'
urlpatterns = [
    path(route='login', view=views.login_user, name='login'),
    path(route='logout', view=views.logout_request, name='logout'),
    path(route='register', view=views.registration, name='register'),
    path("get_cars", views.get_cars, name="getcars"),
    path("get_dealers", views.get_dealerships, name="get_dealers"),
    path("get_dealers/<str:state>", views.get_dealerships, name="get_dealers_by_state"),
    # path for dealer reviews view
    # path for add a review view
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)