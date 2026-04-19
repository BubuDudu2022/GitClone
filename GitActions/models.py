from django.db import models
from django.contrib.auth.models import User


# 📁 Repository
class Repository(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_repos')
    created_at = models.DateTimeField(auto_now_add=True)


# 👥 Collaborators with Roles
class Collaborator(models.Model):
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('maintainer', 'Maintainer'),
        ('contributor', 'Contributor'),
        ('viewer', 'Viewer'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    repo = models.ForeignKey(Repository, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    class Meta:
        unique_together = ('user', 'repo')


# 🌿 Branch
class Branch(models.Model):
    name = models.CharField(max_length=100)
    repo = models.ForeignKey(Repository, on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)


# 💾 Commit
class Commit(models.Model):
    message = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)


# 📄 File (basic simulation)
class File(models.Model):
    repo = models.ForeignKey(Repository, on_delete=models.CASCADE)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    file_path = models.CharField(max_length=255)
    content = models.TextField()
    last_commit = models.ForeignKey(Commit, on_delete=models.SET_NULL, null=True)


# 🔀 Pull Request
class PullRequest(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('approved', 'Approved'),
        ('changes_requested', 'Changes Requested'),
        ('rejected', 'Rejected'),
        ('merged', 'Merged'),
    ]

    title = models.CharField(max_length=255)
    code = models.TextField()
    source_branch = models.ForeignKey(Branch, related_name='source_prs', on_delete=models.CASCADE)
    target_branch = models.ForeignKey(Branch, related_name='target_prs', on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)


# 💬 PR Comment
class PRComment(models.Model):
    pr = models.ForeignKey(PullRequest, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


# 📍 Line-level Comment
class CodeComment(models.Model):
    pr = models.ForeignKey(PullRequest, on_delete=models.CASCADE)
    file_path = models.CharField(max_length=255)
    line_number = models.IntegerField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


# 🧾 Review
class Review(models.Model):
    REVIEW_CHOICES = [
        ('approved', 'Approved'),
        ('changes_requested', 'Changes Requested'),
        ('rejected', 'Rejected'),
    ]

    pr = models.ForeignKey(PullRequest, on_delete=models.CASCADE)
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=30, choices=REVIEW_CHOICES)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)