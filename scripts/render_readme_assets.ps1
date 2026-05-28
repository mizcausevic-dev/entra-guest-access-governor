$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$screenshots = Join-Path $root "screenshots"
New-Item -ItemType Directory -Force -Path $screenshots | Out-Null

Add-Type -AssemblyName System.Drawing

function New-ProofImage {
    param(
        [string]$Path,
        [string]$Title,
        [string]$Subtitle,
        [string[]]$Bullets
    )

    $bitmap = New-Object System.Drawing.Bitmap 1600, 1000
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.Clear([System.Drawing.Color]::FromArgb(7, 10, 15))

    $panelBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(11, 18, 32))
    $greenBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(55, 255, 139))
    $blueBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(25, 199, 255))
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(233, 243, 255))
    $mutedBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(171, 186, 201))
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(42, 111, 88), 2)

    $graphics.FillRectangle($panelBrush, 48, 48, 1504, 904)
    $graphics.DrawRectangle($borderPen, 48, 48, 1504, 904)

    $eyebrowFont = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
    $titleFont = New-Object System.Drawing.Font("Georgia", 34, [System.Drawing.FontStyle]::Bold)
    $bodyFont = New-Object System.Drawing.Font("Segoe UI", 18)
    $bulletFont = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Bold)

    $graphics.DrawString("Entra Guest Access Governor", $eyebrowFont, $greenBrush, 92, 92)
    $graphics.DrawString($Title, $titleFont, $textBrush, 92, 142)
    $graphics.DrawString($Subtitle, $bodyFont, $mutedBrush, 92, 214)

    $y = 320
    foreach ($bullet in $Bullets) {
        $graphics.DrawString("•", $bulletFont, $blueBrush, 108, $y)
        $graphics.DrawString($bullet, $bodyFont, $textBrush, 138, $y + 2)
        $y += 82
    }

    $graphics.DrawString("Synthetic proof render for README packaging.", $bodyFont, $mutedBrush, 92, 880)
    $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
}

New-ProofImage -Path (Join-Path $screenshots "01-overview-proof.png") `
    -Title "Guest invitations, sponsor drift, and partner trust in one operator surface." `
    -Subtitle "Invitation sprawl, access reviews, sponsor ownership, inactive guests, and cross-tenant trust stay visible together." `
    -Bullets @(
        "Invitation governance stays tied to sponsor and intake controls.",
        "Review hygiene and inactive guest cleanup stay visible before renewal.",
        "Recruiter-facing Entra guest governance proof without exposing tenant credentials."
    )

New-ProofImage -Path (Join-Path $screenshots "02-guest-lane-proof.png") `
    -Title "Owner-mapped guest lanes instead of raw collaboration exports." `
    -Subtitle "Each lane ties owner, focus, and next action together so B2B remediation stays readable." `
    -Bullets @(
        "Identity Governance owns invitation and sponsor discipline.",
        "Platform Operations owns review hygiene and stale guest cleanup.",
        "Security Operations owns cross-tenant trust boundaries."
    )

New-ProofImage -Path (Join-Path $screenshots "03-access-gaps-proof.png") `
    -Title "The risk table stays specific: invitation sprawl, stale reviews, and sponsor drift." `
    -Subtitle "The lane is grounded in Entra guest exports rather than generic cloud-security copy." `
    -Bullets @(
        "High-severity control gaps sort first.",
        "Each row keeps owner, family, subject, and message visible.",
        "The system makes guest governance cleanup auditable."
    )

New-ProofImage -Path (Join-Path $screenshots "04-review-posture-proof.png") `
    -Title "Review packets make renewal posture readable." `
    -Subtitle "Completeness, blocker, and checkpoint pressure stay visible for every guest-governance lane." `
    -Bullets @(
        "Executive collaboration and supplier renewals stay separated cleanly.",
        "Partner trust and audit restoration remain visible before review close.",
        "The system is shaped for real Entra guest governance proof."
    )
