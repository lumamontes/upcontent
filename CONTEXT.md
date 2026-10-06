# Upcontent Context

Upcontent renders documentation repositories into static portals. This context defines the publication and discoverability terms used by the renderer and its consumer repositories.

## Publication And Discoverability

**Private source**:
The Git repository containing the documentation is access-controlled. This says nothing about the visibility of the generated portal.
_Avoid_: private portal

**Public portal**:
A generated portal that is publicly accessible and has explicitly enabled SEO discoverability.
_Avoid_: public repository

**Unlisted portal**:
A publicly accessible portal that asks crawlers not to index its pages. It is not access control and must not be described as private.
_Avoid_: private portal

**Private portal**:
A generated portal protected by the hosting layer so unauthenticated visitors and crawlers cannot access its content.
_Avoid_: hidden portal, noindex portal

**SEO policy**:
The explicit site-level choice to enable or disable search-engine discoverability for a portal. SEO is opt-in; page-level `noindex` can narrow an enabled policy to individual pages.
_Avoid_: SEO config, SEO mode
