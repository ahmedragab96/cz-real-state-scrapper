import mjml2html from "mjml";
import { RegionListings } from "../scrapers/types";

export function generateListingsEmail(regionListings: RegionListings) {
  const mjml = `
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="Arial, sans-serif" />
    </mj-attributes>
    <mj-style inline="inline">
      .region-title {
        font-size: 20px;
        color: #004d40;
        font-weight: bold;
        border-bottom: 2px solid #007b55;
        padding-bottom: 4px;
        margin-bottom: 12px;
      }
      .count-badge {
        background: #007b55;
        color: white;
        border-radius: 30px;
        padding: 3px 8px;
        font-size: 13px;
        margin-left: 8px;
      }
      .price {
        color: rgb(0, 123, 85);
        font-size: 13px;
        font-weight: 700;
        margin-bottom: 4px;
      }
      .locality {
        font-size: 13px;
        color: rgb(102, 102, 102);
        margin-bottom: 4px;
      }
      .listing-title {
        font-size: 14px;
        font-weight: 700;
        margin: 6px 0;
      }
      .info {
        color: rgb(153, 153, 153);
        font-size: 13px;
        margin: 2px 0;
      }
      .btn {
        display: inline-block;
        background-color: #007b55;
        color: #fff !important;
        font-weight: 600;
        text-decoration: none;
        padding: 8px 14px;
        border-radius: 6px;
      }
    </mj-style>
  </mj-head>

  <mj-body background-color="#f7f7f7">
    <mj-section>
      <mj-column>
        <mj-text align="center" font-size="24px" font-weight="bold" color="#333">
          🏡 New Property Listings in Czech Regions
        </mj-text>
      </mj-column>
    </mj-section>

    ${Object.entries(regionListings)
      .map(
        ([region, { count, data }]) => `
        <mj-section padding="10px 20px 0">
          <mj-column>
            <mj-text css-class="region-title">
              ${region} <span class="count-badge">${count}</span>
            </mj-text>
          </mj-column>
        </mj-section>

        <mj-section padding="0 20px" background-color="#f7f7f7">
          <mj-group>
            ${data
              .map(
                (listing) => `
                <mj-column width="50%" padding="10px">
                  <mj-image
                    src="${listing.images[0]}"
                    alt="${listing.title}"
                    border-radius="12px 12px 0 0"
                    width="300px"
                    height="auto"
                  />
                  <mj-text css-class="listing-title">
                    ${listing.title}
                  </mj-text>
                  <mj-text css-class="locality">🗺️ ${listing.location.locality}</mj-text>
                  <mj-text css-class="price">💰 ${listing.price} Kč</mj-text>
                  <mj-text css-class="info">🌿 Land: ${listing.landArea ?? "N/A"} m²</mj-text>
                  <mj-button
                    href="${listing.url}"
                    background-color="#007b55"
                    color="#fff"
                    font-size="14px"
                    border-radius="6px"
                    inner-padding="8px 14px"
                  >
                    View Listing
                  </mj-button>
                </mj-column>
              `
              )
              .join("")}
          </mj-group>
        </mj-section>
      `
      )
      .join("")}
  </mj-body>
</mjml>`;

  const { html } = mjml2html(mjml, { validationLevel: "strict" });
  return html;
}