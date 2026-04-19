from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework.response import Response
from .models import *


def get_user_role(user_id, repo_id):
    if not user_id:
        return None
    try:
        return Collaborator.objects.get(
            user_id=user_id,
            repo__id=repo_id   # ✅ FIX
        ).role
    except Collaborator.DoesNotExist:
        return None

class RegisterView(APIView):
    def post(self, request):
        user = User.objects.create_user(
            username=request.data['username'],
            password=request.data['password']
        )
        return Response({"id": user.id, "username": user.username})

from django.contrib.auth import authenticate

class LoginView(APIView):
    def post(self, request):
        user = authenticate(
            username=request.data['username'],
            password=request.data['password']
        )

        if user:
            return Response({"id": user.id, "username": user.username})
        return Response({"error": "Invalid credentials"}, status=400)


class RepositoryDetailView(APIView):

    def get(self, request, repo_id):
        repo = Repository.objects.get(id=repo_id)

        return Response({
            "id": repo.id,
            "name": repo.name,
            "owner": {
                "id": repo.owner.id,
                "username": repo.owner.username
            }
        })
    

class FileView(APIView):

    def get(self, request):
        repo_id = request.query_params.get('repo_id')
        repo = Repository.objects.get(id=repo_id)

        branch = Branch.objects.get(
            repo_id=repo,
            name="main"
        )

        files = File.objects.filter(
            repo_id=repo,
            branch=branch
        )

        return Response([
            {
                "id": f.id,
                "file_path": f.file_path,
                "content": f.content
            }
            for f in files
        ])
    
# 🏠 Dashboard
class HomeView(APIView):
    def get(self, request):
        return Response({
            "total_repositories": Repository.objects.count(),
            "open_prs": PullRequest.objects.filter(status='open').count(),
            "merged_prs": PullRequest.objects.filter(status='merged').count()
        })



class RepositoryView(APIView):

    def get(self, request):
        repos = Repository.objects.all()
        return Response([
    {
        "id": r.id,
        "name": r.name,
        "owner": {
            "id": r.owner.id,
            "username": r.owner.username
        }
    }
    for r in repos ])

    def post(self, request):
        user_id = request.data.get('owner_id')

        if not User.objects.filter(id=user_id).exists():
            return Response({"error": "Invalid user"}, status=400)

        repo = Repository.objects.create(
            name=request.data['name'],
            description=request.data.get('description', ''),
            owner_id=user_id
        )

        Branch.objects.create(
        name="main",
        repo=repo,
        created_by_id=user_id
        )

        Collaborator.objects.create(
            user_id=user_id,
            repo=repo,
            role='owner'
        )

        return Response({"repo_id": repo.id})


# 👥 Collaborators
class CollaboratorView(APIView):

    def get(self, request):
        repo_id = request.query_params.get('repo_id')

        collabs = Collaborator.objects.filter(repo_id=repo_id)

        return Response([
            {
                "user_id": c.user.id,
                "username": c.user.username,
                "role": c.role
            }
            for c in collabs
        ])

    def post(self, request):
        added_by = request.data.get('added_by')
        repo_id = request.data.get('repo_id')

        print("👉 ADDED_BY:", added_by)
        print("👉 REPO_ID:", repo_id)

        role = get_user_role(added_by, repo_id)

        print("👉 ROLE FOUND:", role)

        if role not in ['owner', 'maintainer']:
            print("❌ PERMISSION DENIED")
            return Response({"error": "Permission denied"}, status=403)

        # ✅ NEW: handle username OR user_id
        user_input = request.data.get('username')

        try:
            if str(user_input).isdigit():
                user = User.objects.get(id=user_input)
            else:
                user = User.objects.get(username=user_input)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        # ✅ CHECK EXISTING
        existing = Collaborator.objects.filter(
            user=user,
            repo_id=repo_id
        ).first()

        if existing:
            print(" already a collaborator")
            return Response({
                "error": "User is already a collaborator"
            }, status=400)

        # ✅ CREATE
        Collaborator.objects.create(
            user=user,
            repo_id=repo_id,
            role=request.data['role']
        )

        return Response({"message": "Collaborator added"})

    def delete(self, request):
        user_id = request.data.get('user_id')
        repo_id = request.data.get('repo_id')

        if not user_id:
            return Response({"error": "user_id required"}, status=400)

        Collaborator.objects.filter(
            user_id=user_id,
            repo_id=repo_id
        ).delete()

        return Response({"message": "Removed"})
    
class PullRequestView(APIView):

    def get(self, request):
        repo_id = request.query_params.get('repo_id')

        prs = PullRequest.objects.filter(
            source_branch__repo_id=repo_id
        )

        return Response([

            {"id": pr.id, "title": pr.title, "status": pr.status, "code": pr.code, "created_by": pr.created_by.username}
            for pr in prs
        ])

    def post(self, request):
        user_id = request.data.get('user_id')
        repo_id = request.data.get('repo_id')

        if not user_id or not repo_id:
            return Response({"error": "Missing data"}, status=400)

        role = get_user_role(user_id, repo_id)

        # ✅ Get or create main branch
        main_branch, _ = Branch.objects.get_or_create(
            repo_id=repo_id,
            name="main",
            defaults={"created_by_id": user_id}
        )

        # 👑 OWNER → direct commit
        if role == "owner":
            commit = Commit.objects.create(
                message=request.data['title'],
                author_id=user_id,
                branch=main_branch
            )

            File.objects.update_or_create(
                repo_id=repo_id,
                branch=main_branch,
                file_path=request.data['file_path'],
                defaults={
                    "content": request.data['code'],
                    "last_commit": commit
                }
            )

            return Response({"message": "Added to main"})

        # 👤 NON-OWNER → create branch + PR

        branch_name = f"user-{user_id}-{request.data['file_path']}"

        user_branch = Branch.objects.create(
            name=branch_name,
            repo_id=repo_id,
            created_by_id=user_id
        )

        # ✅ CREATE COMMIT
        commit = Commit.objects.create(
            message=request.data['title'],
            author_id=user_id,
            branch=user_branch
        )

        # ✅ SAVE FILE IN BRANCH (VERY IMPORTANT 🔥)
        File.objects.create(
            repo_id=repo_id,
            branch=user_branch,
            file_path=request.data['file_path'],
            content=request.data['code'],
            last_commit=commit
        )

        # ✅ CREATE PR (code field now optional)
        pr = PullRequest.objects.create(
            title=request.data['title'],
            code=request.data['code'],  # optional now
            source_branch=user_branch,
            target_branch=main_branch,
            created_by_id=user_id
        )

        return Response({"message": "PR created", "pr_id": pr.id})
    

class ReviewView(APIView):

    def post(self, request):
        user_id = request.data.get('user_id')

        if not user_id:
            return Response({"error": "user_id required"}, status=400)

        Review.objects.create(
            pr_id=request.data['pr_id'],
            reviewer_id=user_id,
            status=request.data['status'],
            comment=request.data.get('comment', '')
        )

        pr = PullRequest.objects.get(id=request.data['pr_id'])

        if request.data['status'] == 'approved':
            pr.status = 'approved'
        elif request.data['status'] == 'changes_requested':
            pr.status = 'changes_requested'
        elif request.data['status'] == 'rejected':
            pr.status = 'rejected'

        pr.save()

        return Response({"message": "Review submitted"})
    
class PullRequestActionView(APIView):

    def post(self, request, pr_id):
        user_id = request.data.get('user_id')

        if not user_id:
            return Response({"error": "user_id required"}, status=400)

        pr = PullRequest.objects.get(id=pr_id)

        role = get_user_role(user_id, pr.source_branch.repo.id)

        if role not in ['owner', 'maintainer']:
            return Response({"error": "Permission denied"}, status=403)

        if request.data['action'] == 'merge':
            
            
            main_branch = Branch.objects.get(name="main", repo=pr.source_branch.repo)
            source_files = File.objects.filter(branch=pr.source_branch)

            for file in source_files:
                File.objects.update_or_create(
                    repo=pr.source_branch.repo, 
                    branch=main_branch,
                    file_path=file.file_path,
                    defaults={
                        "content": file.content,
                        "last_commit": file.last_commit
                    }
                )

            pr.status = 'merged'

        pr.save()

        return Response({"message": "Action completed"})
    
class CommitView(APIView):

    def post(self, request):
        user_id = request.data.get('user_id')

        if not user_id:
            return Response({"error": "user_id required"}, status=400)

        branch = Branch.objects.get(id=request.data['branch_id'])

        if branch.name == "main":
            return Response({"error": "Cannot commit directly to main"}, status=400)

        commit = Commit.objects.create(
            message=request.data['message'],
            author_id=user_id,
            branch=branch
        )

        File.objects.update_or_create(
            branch=branch,
            file_path=request.data['file_path'],
            defaults={
                "content": request.data['content'],
                "last_commit": commit
            }
        )

        return Response({"commit_id": commit.id, "message": "Commit successful"})
    

class PullRequestDetailView(APIView):

    def get(self, request, pr_id):
        pr = PullRequest.objects.get(id=pr_id)

        reviews = Review.objects.filter(pr=pr)
        comments = PRComment.objects.filter(pr=pr)

        return Response({
            "id": pr.id,
            "title": pr.title,
            "status": pr.status,
            "code": pr.code,

            "created_by": pr.created_by.username,

            "reviews": [
                {
                    "reviewer": r.reviewer.username,
                    "status": r.status,
                    "comment": r.comment
                } for r in reviews
            ],

            "comments": [
                {
                    "user": c.user.username,
                    "comment": c.comment_text
                } for c in comments
            ]
        })
    

class PRCommentView(APIView):

    def post(self, request):
        user_id = request.data.get('user_id')

        if not user_id:
            return Response({"error": "user_id required"}, status=400)

        PRComment.objects.create(
            pr_id=request.data['pr_id'],
            user_id=user_id,
            comment_text=request.data['comment']
        )

        return Response({"message": "Comment added"})