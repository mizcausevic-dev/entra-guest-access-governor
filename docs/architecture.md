# Architecture

`entra-guest-access-governor` has two layers:

1. **Offline analyzer**
   - reads guest-access and cross-tenant posture exports
   - computes findings and summary metrics
   - supports JSON, markdown, and summary CLI output

2. **Public operator surface**
   - renders overview, guest-lane, access-gaps, review-posture, verification, and docs views
   - prerenders static Pages output with `robots.txt`, `sitemap.xml`, and `CNAME`
