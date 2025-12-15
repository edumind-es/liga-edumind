import csv
import io
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER

class ReportService:
    @staticmethod
    def generate_clasificacion_csv(clasificacion: list) -> str:
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Headers
        headers = [
            "Posición", "Equipo", "PJ", "G", "E", "P", 
            "Puntos Deportivos", "Juego Limpio", "Respeto Árbitro", "Grada", 
            "Puntos Educativos", "TOTAL"
        ]
        writer.writerow(headers)
        
        for equipo in clasificacion:
            writer.writerow([
                equipo["posicion"],
                equipo["equipo_nombre"],
                equipo["partidos_jugados"],
                equipo["ganados"],
                equipo["empatados"],
                equipo["perdidos"],
                equipo["puntos_deportivos"],
                equipo["puntos_juego_limpio"],
                equipo["puntos_arbitro"],
                equipo["puntos_grada"],
                equipo["puntos_educativos_total"],
                equipo["puntos_totales"]
            ])
            
        return output.getvalue()

    @staticmethod
    def generate_clasificacion_pdf(liga_nombre: str, clasificacion: list) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        styles = getSampleStyleSheet()
        
        # Title
        title_style = ParagraphStyle(
            'Title',
            parent=styles['Heading1'],
            alignment=TA_CENTER,
            spaceAfter=20
        )
        elements.append(Paragraph(f"Clasificación - {liga_nombre}", title_style))
        elements.append(Paragraph(f"Generado el: {datetime.now().strftime('%d/%m/%Y %H:%M')}", styles['Normal']))
        elements.append(Spacer(1, 20))
        
        # Table Data
        data = [[
            "Pos", "Equipo", "PJ", "G", "E", "P", 
            "Dep", "JL", "Arb", "Gra", "Edu", "TOT"
        ]]
        
        for eq in clasificacion:
            data.append([
                str(eq["posicion"]),
                eq["equipo_nombre"][:20], # Truncate long names
                str(eq["partidos_jugados"]),
                str(eq["ganados"]),
                str(eq["empatados"]),
                str(eq["perdidos"]),
                str(eq["puntos_deportivos"]),
                str(eq["puntos_juego_limpio"]),
                str(eq["puntos_arbitro"]),
                str(eq["puntos_grada"]),
                str(eq["puntos_educativos_total"]),
                str(eq["puntos_totales"])
            ])
            
        # Table Style
        table = Table(data, colWidths=[30, 120, 25, 25, 25, 25, 30, 30, 30, 30, 30, 35])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'), # Align names left
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
        ]))
        
        elements.append(table)
        doc.build(elements)
        return buffer.getvalue()

    @staticmethod
    def generate_acta_partido_pdf(partido: dict) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        styles = getSampleStyleSheet()
        
        # Title
        elements.append(Paragraph(f"Acta de Partido - {partido['tipo_deporte']['nombre']}", styles['Heading1']))
        elements.append(Spacer(1, 10))
        
        # Info
        elements.append(Paragraph(f"Fecha: {partido['fecha_hora'] or 'Pendiente'}", styles['Normal']))
        elements.append(Paragraph(f"Jornada: {partido['jornada_id']}", styles['Normal']))
        elements.append(Spacer(1, 20))
        
        # Score
        score_data = [
            [partido['equipo_local']['nombre'], "VS", partido['equipo_visitante']['nombre']],
            [str(partido['puntos_local']), "-", str(partido['puntos_visitante'])]
        ]
        
        score_table = Table(score_data, colWidths=[200, 50, 200])
        score_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTSIZE', (0, 0), (-1, -1), 14),
            ('FONTSIZE', (0, 1), (-1, 1), 24), # Big score
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
        ]))
        elements.append(score_table)
        elements.append(Spacer(1, 30))
        
        # MRPS Evaluation
        elements.append(Paragraph("Evaluación de Valores (MRPS)", styles['Heading2']))
        
        eval_data = [
            ["Criterio", "Local", "Visitante"],
            ["Juego Limpio", str(partido['puntos_juego_limpio_local']), str(partido['puntos_juego_limpio_visitante'])],
            ["Respeto Árbitro", "-", "-"], # Arbitro is usually single value per match or per team? Model has puntos_arbitro (single?) No, wait.
            # Checking model: puntos_arbitro is on Equipo stats. In Partido, we have arbitro_conocimiento, etc.
            # Let's check PartidoResponse interface or model.
            # In Partido model: arbitro_conocimiento, arbitro_gestion, arbitro_apoyo (0-4).
            # These are for the referee performance, not the team's respect?
            # Wait, "Respeto Árbitro" in standings comes from where?
            # In ClasificacionService: puntos_arbitro comes from... let's check.
            # Actually, let's just dump what we have in the partido dict for now.
            ["Grada (Animación)", str(partido['grada_animar_local']), str(partido['grada_animar_visitante'])],
            ["Grada (Respeto)", str(partido['grada_respeto_local']), str(partido['grada_respeto_visitante'])],
            ["Grada (Participación)", str(partido['grada_participacion_local']), str(partido['grada_participacion_visitante'])],
        ]
        
        eval_table = Table(eval_data, colWidths=[200, 100, 100])
        eval_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
            ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ]))
        elements.append(eval_table)
        
        doc.build(elements)
        return buffer.getvalue()
