#!/usr/bin/env python3
"""
Générateur du PDF A4 de la Page de Synthèse MVP CineChroma
Utilise ReportLab pour produire un document d'une seule page A4 stricte.
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
import pypdf

OUTPUT_PDF = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "CineChroma_MVP_Synthese.pdf")

def generate_pdf():
    # Marges : 18mm gauche/droite (51 pts), 16mm haut/bas (45 pts)
    margin_lr = 52
    margin_tb = 44
    
    doc = SimpleDocTemplate(
        OUTPUT_PDF,
        pagesize=A4,
        leftMargin=margin_lr,
        rightMargin=margin_lr,
        topMargin=margin_tb,
        bottomMargin=margin_tb
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=3
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#334155'),
        spaceAfter=3
    )

    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#64748b'),
        spaceAfter=14
    )

    h2_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=8,
        spaceAfter=3
    )

    body_style = ParagraphStyle(
        'BodyJustified',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.8,
        leading=12.2,
        alignment=TA_JUSTIFY,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=3
    )

    bullet_style = ParagraphStyle(
        'BulletItem',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.8,
        leading=12.0,
        alignment=TA_JUSTIFY,
        textColor=colors.HexColor('#1e293b'),
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=2
    )

    story = []

    # En-tête
    story.append(Paragraph("CineChroma", title_style))
    story.append(Paragraph("Exploration et indexation chromatique du patrimoine cinématographique", subtitle_style))
    story.append(Paragraph("Julien Arsène &middot; MVP &middot; novembre 2026", meta_style))

    # Contexte
    story.append(Paragraph("Contexte", h2_style))
    contexte_txt = (
        "L'affiche d'un film constitue sa première signature esthétique et émotionnelle. Pourtant, "
        "les plateformes cinématographiques ne permettent d'explorer les œuvres que par métadonnées "
        "textuelles (titre, genre, réalisateur). Pour regrouper et analyser des œuvres selon leur couleur dominante, "
        "il faut numériser cette composante visuelle. On utilise pour cela l'espace colorimétrique CIELAB, "
        "qui modélise la perception humaine des écarts de couleur de manière plus fidèle que le traditionnel "
        "modèle RGB. Un algorithme de partitionnement (<i>K-Means</i>) regroupe les pixels d'une affiche en cinq "
        "teintes dominantes (sa palette chromatique). La base TMDb (<i>The Movie Database</i>) fournit les métadonnées "
        "ainsi que des versions d'affiches « textless » (dépourvues de texte promotionnel), garantissant que l'analyse "
        "porte uniquement sur l'identité picturale de l'œuvre."
    )
    story.append(Paragraph(contexte_txt, body_style))

    # 1. Quoi et pour qui
    story.append(Paragraph("1. Quoi et pour qui", h2_style))
    quoi_txt = (
        "CineChroma est une plateforme web interactive qui permet d'explorer, de filtrer et de redécouvrir "
        "le cinéma à travers le prisme de la couleur. L'utilisateur sélectionne une ou plusieurs teintes sur un "
        "nuancier pour trouver instantanément toutes les œuvres partageant cette harmonie visuelle, ou teste sa "
        "culture esthétique via des mini-jeux dédiés. Le projet s'adresse aux cinéphiles en quête d'inspiration visuelle, "
        "aux directeurs artistiques et graphistes cherchant des références chromatiques concrètes, ainsi qu'aux étudiants "
        "et chercheurs en arts visuels."
    )
    story.append(Paragraph(quoi_txt, body_style))

    # 2. Ce que fait le MVP
    story.append(Paragraph("2. Ce que fait le MVP", h2_style))
    mvp_intro = (
        "Le MVP est une application web entièrement déployée et fonctionnelle en ligne. Elle s'appuie sur une base de "
        "données de 16 233 œuvres (films, séries et animés) dont chaque affiche a été nettoyée et décomposée en une palette "
        "de 5 couleurs LAB. Concrètement :"
    )
    story.append(Paragraph(mvp_intro, body_style))

    story.append(Paragraph(
        "&bull; <b>Moteur chromatique temps réel :</b> l'utilisateur choisit une teinte via un sélecteur libre (2D Cosmos), "
        "une pipette ou un nuancier. Un curseur de tolérance (distance perceptuelle Delta E) et un mode logique (OU/ET pour "
        "combiner plusieurs couleurs) filtrent instantanément les 16 000 œuvres sans latence dans le navigateur.",
        bullet_style
    ))
    story.append(Paragraph(
        "&bull; <b>Hub de 4 mini-jeux jouables :</b> <i>PalettePure</i> (retrouver le film associé à 5 couleurs), "
        "<i>ChronoChroma</i> (défi de rapidité), <i>CouleurQuiz</i> (QCM visuel) et <i>AfficheFlou</i> (l'affiche se dévoile "
        "au fil des indices).",
        bullet_style
    ))
    story.append(Paragraph(
        "&bull; <b>Pipeline automatisé :</b> un script Python exécuté chaque semaine via GitHub Actions actualise les scores "
        "de popularité TMDb et intègre les nouvelles sorties cinéma sans intervention manuelle.",
        bullet_style
    ))

    # 3. Critère de réussite
    story.append(Paragraph("3. Critère de réussite", h2_style))
    critere_txt = (
        "Le projet sera réussi si un utilisateur sans connaissance technique parvient à formuler une recherche par couleur "
        "et à découvrir en moins de 30 secondes un film dont l'harmonie visuelle correspond à son attente, et si un panel de "
        "10 testeurs juge à plus de 85 % que les palettes extraites reflètent fidèlement la dominante perçue de l'affiche."
    )
    story.append(Paragraph(critere_txt, body_style))

    # 4. Suites
    story.append(Paragraph("4. Suites", h2_style))
    suites_txt = (
        "La prochaine étape est d'étendre l'analyse colorimétrique au-delà de l'affiche, en extrayant les palettes des photogrammes "
        "et scènes clés des films. Je développerai ensuite une visualisation statistique en trois dimensions (Three.js) projetant "
        "l'évolution des tendances de couleur du cinéma par décennie et par réalisateur. Le rendu final visé est la plateforme "
        "web enrichie, accompagnée d'un rapport d'analyse esthétique et d'une vidéo de présentation."
    )
    story.append(Paragraph(suites_txt, body_style))

    # 5. Documents associés
    story.append(Paragraph("5. Documents associés", h2_style))
    docs_txt = (
        "Je joins l'accès à la version en ligne (<b>https://cinechroma.vercel.app/</b>), le dépôt GitHub complet comprenant le "
        "code source web et le pipeline de traitement Python, ainsi que le notebook de recherche exploratoire "
        "(<i>Notebook projet couleur.ipynb</i>) détaillant les expérimentations algorithmiques sur l'espace LAB. J'ajoute une "
        "vidéo de démonstration de deux minutes illustrant la recherche par nuancier et une session de jeu."
    )
    story.append(Paragraph(docs_txt, body_style))

    # Génération
    doc.build(story)
    print(f"✅ PDF généré avec succès : {OUTPUT_PDF}")

    # Vérification du nombre de pages
    reader = pypdf.PdfReader(OUTPUT_PDF)
    nb_pages = len(reader.pages)
    print(f"📄 Nombre total de pages : {nb_pages}")
    if nb_pages == 1:
        print("🎯 Parfait : Le document fait exactement 1 page A4 !")
    else:
        print(f"⚠️ Attention : Le document fait {nb_pages} pages, ajuster la taille.")

if __name__ == "__main__":
    generate_pdf()
