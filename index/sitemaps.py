from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from .models import Project

class BaseSitemap(Sitemap):
    # This replaces the need for the "Sites" framework in Admin
    def get_urls(self, site=None, **kwargs):
        # Pass your real domain here manually
        return super().get_urls(site=type('Site', (), {'domain': 'morkunas.info'}), **kwargs)

class StaticViewSitemap(BaseSitemap):
    priority = 0.5
    changefreq = 'monthly'

    def items(self):
        # Match these to your 'name=' attributes in urlpatterns
        return ['index', 'about_me', 'my_knowledge', 'blog_index', 'privacy']

    def location(self, item):
        return reverse(item)

class ProjectSitemap(BaseSitemap):
    priority = 0.8
    changefreq = 'weekly'

    def items(self):
        return Project.objects.all()