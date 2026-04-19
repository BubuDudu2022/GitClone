from django.contrib import admin
from .models import *

admin.site.register(Repository)
admin.site.register(Collaborator)
admin.site.register(Branch)
admin.site.register(Commit)
admin.site.register(File)
admin.site.register(PullRequest)
admin.site.register(PRComment)
admin.site.register(Review)
admin.site.register(CodeComment)
