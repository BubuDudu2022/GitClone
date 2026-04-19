from django.urls import path
from .views import *

urlpatterns = [
    path('', HomeView.as_view()),
    path("register/", RegisterView.as_view()),
    path("login/", LoginView.as_view()),

    path('repositories/', RepositoryView.as_view()),

    path('repositories/<int:repo_id>/', RepositoryDetailView.as_view()),

    path('collaborators/', CollaboratorView.as_view()),

    path('pull-requests/', PullRequestView.as_view()),
    path('pull-requests/<int:pr_id>/action/', PullRequestActionView.as_view()),

    path('reviews/', ReviewView.as_view()),
    path('commits/create/', CommitView.as_view()),

    path("pr-comments/", PRCommentView.as_view()),

    path('pull-requests/<int:pr_id>/', PullRequestDetailView.as_view()),
    path('files/', FileView.as_view()),  # Code tab
    path('collaborators/', CollaboratorView.as_view()), 
]