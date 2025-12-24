import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Color palette
const colors = {
  primary: '#0d9488',
  primaryLight: '#ccfbf1',
  primaryDark: '#0f766e',
  breakfast: '#fef3c7',
  breakfastBorder: '#f59e0b',
  lunch: '#fee2e2',
  lunchBorder: '#ef4444',
  dinner: '#dbeafe',
  dinnerBorder: '#3b82f6',
  snack: '#dcfce7',
  snackBorder: '#22c55e',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  white: '#ffffff',
  danger: '#ef4444',
};

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 9,
    fontFamily: 'Helvetica',
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingBottom: 15,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoBox: {
    width: 28,
    height: 28,
    backgroundColor: colors.white,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
  },
  brandName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 3,
  },
  headerDate: {
    fontSize: 8,
    color: colors.primaryLight,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  // Patient Info Box
  infoBox: {
    backgroundColor: colors.gray50,
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  infoTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.gray800,
    marginBottom: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    width: '50%',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 7,
    color: colors.gray500,
  },
  infoValue: {
    fontSize: 9,
    color: colors.gray800,
    fontWeight: 'bold',
  },
  // Limits Box
  limitsBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  limitsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 6,
  },
  limitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  limitItem: {
    width: '33.33%',
    marginBottom: 4,
  },
  limitLabel: {
    fontSize: 7,
    color: colors.gray600,
  },
  limitValue: {
    fontSize: 8,
    color: colors.gray800,
    fontWeight: 'bold',
  },
  // Day Section
  daySection: {
    marginBottom: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingBottom: 4,
  },
  dayBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 8,
  },
  dayBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: colors.white,
  },
  dayTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.gray800,
  },
  // Meals Grid
  mealsRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  mealCard: {
    flex: 1,
    borderRadius: 4,
    padding: 8,
    marginHorizontal: 2,
    borderLeftWidth: 3,
  },
  mealCardBreakfast: {
    backgroundColor: colors.breakfast,
    borderLeftColor: colors.breakfastBorder,
  },
  mealCardLunch: {
    backgroundColor: colors.lunch,
    borderLeftColor: colors.lunchBorder,
  },
  mealCardDinner: {
    backgroundColor: colors.dinner,
    borderLeftColor: colors.dinnerBorder,
  },
  mealCardSnack: {
    backgroundColor: colors.snack,
    borderLeftColor: colors.snackBorder,
  },
  mealTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: colors.gray800,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  mealItem: {
    fontSize: 7,
    color: colors.gray700,
    marginBottom: 2,
    lineHeight: 1.3,
  },
  mealNutrition: {
    fontSize: 6,
    color: colors.gray500,
    marginTop: 2,
    fontStyle: 'italic',
  },
  // Notes section
  notesBox: {
    backgroundColor: '#fef3c7',
    borderRadius: 6,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.gray800,
    marginBottom: 4,
  },
  noteItem: {
    fontSize: 7,
    color: colors.gray700,
    marginBottom: 2,
    lineHeight: 1.3,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.gray50,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    padding: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 6,
    color: colors.gray500,
  },
  footerWarning: {
    fontSize: 6,
    color: colors.danger,
    fontWeight: 'bold',
  },
  footerBrand: {
    fontSize: 7,
    color: colors.primary,
    fontWeight: 'bold',
  },
});

interface MealPlanPDFProps {
  content: string;
}

interface Meal {
  name: string;
  items: string[];
  nutrition?: string;
}

interface Day {
  name: string;
  meals: Meal[];
}

interface ParsedPlan {
  title: string;
  patientInfo: { label: string; value: string }[];
  limits: { label: string; value: string }[];
  days: Day[];
  notes: string[];
}

export function MealPlanPDF({ content }: MealPlanPDFProps) {
  // Parse the markdown content into structured data
  const parsePlan = (markdown: string): ParsedPlan => {
    const lines = markdown.split('\n');
    const plan: ParsedPlan = {
      title: 'Plan Nutricional',
      patientInfo: [],
      limits: [],
      days: [],
      notes: [],
    };

    let currentSection = '';
    let currentDay: Day | null = null;
    let currentMeal: Meal | null = null;
    let inNotes = false;

    // Helper to clean text (remove markdown bold, emojis, variation selectors, etc.)
    const cleanText = (text: string): string => {
      return text
        .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{FE00}-\u{FE0F}]/gu, '')
        .replace(/\*\*/g, '')
        .replace(/^#+\s*/, '')
        .replace(/^-\s*/, '')
        .trim();
    };

    // Helper to detect if a line is a day header
    const isDayHeader = (line: string): boolean => {
      const lower = cleanText(line).toLowerCase();
      // Match patterns like: "Día 1", "día 1 - lunes", "**Día 1**", "### Día 1"
      return /d[íi]a\s*\d|d[íi]a\s+[a-z]+/i.test(lower) ||
             /(lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo)/i.test(lower);
    };

    // Helper to detect meal headers
    const mealNames = ['desayuno', 'comida', 'almuerzo', 'cena', 'colación', 'colaciones', 'snack', 'refrigerio', 'media mañana', 'media tarde', 'merienda'];
    const isMealHeader = (text: string): boolean => {
      const lower = cleanText(text).toLowerCase();
      return mealNames.some(m => lower.startsWith(m) || lower === m);
    };

    // Helper to detect section headers (not inline bold text like **Ingredientes:**)
    const isSectionHeader = (line: string): boolean => {
      if (line.startsWith('#')) return true;
      // Only treat ** as section header if it's a standalone bold title, not inline content
      if (line.startsWith('**')) {
        const lower = line.toLowerCase();
        // These are inline content, not section headers
        if (lower.includes('ingredientes:') || lower.includes('nutrición') || lower.includes('sodio')) {
          return false;
        }
        return true;
      }
      return false;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cleanLine = cleanText(line);
      const lowerClean = cleanLine.toLowerCase();

      // Detect day headers - support multiple formats:
      // "### Día 1", "**Día 1**", "Día 1:", "#### Día 1 - Lunes"
      if (isDayHeader(line) && (isSectionHeader(line) || /^d[íi]a/i.test(cleanLine))) {
        // Save previous day
        if (currentDay) {
          if (currentMeal) currentDay.meals.push(currentMeal);
          plan.days.push(currentDay);
        }
        currentDay = {
          name: cleanLine.replace(/:$/, ''),
          meals: [],
        };
        currentMeal = null;
        currentSection = 'meals';
        continue;
      }

      // Detect meal headers - support:
      // "#### Desayuno", "**Desayuno:**", "- **Desayuno**", "Desayuno:", "🌅 Desayuno"
      if (isMealHeader(cleanLine) && isSectionHeader(line)) {
        // If no day exists yet, create a default "Día 1" for single-day plans
        if (!currentDay) {
          currentDay = {
            name: 'Día 1',
            meals: [],
          };
          currentSection = 'meals';
        }
        if (currentMeal) {
          currentDay.meals.push(currentMeal);
        }
        currentMeal = {
          name: cleanLine.replace(/:$/, ''),
          items: [],
        };
        continue;
      }

      // Main title detection
      if (isSectionHeader(line) && lowerClean.includes('plan') && !currentDay) {
        plan.title = cleanLine;
        currentSection = 'title';
      }
      // Patient info section
      else if (isSectionHeader(line) && (lowerClean.includes('información') || lowerClean.includes('informacion') || lowerClean.includes('datos del paciente'))) {
        currentSection = 'info';
      }
      // Limits section
      else if (isSectionHeader(line) && (lowerClean.includes('límite') || lowerClean.includes('limite') || lowerClean.includes('recomendaciones nutricionales'))) {
        currentSection = 'limits';
      }
      // Notes/Reminder section
      else if (isSectionHeader(line) && (lowerClean.includes('recordatorio') || lowerClean.includes('nota') || lowerClean.includes('importante') || lowerClean.includes('recomendaciones generales'))) {
        if (currentDay) {
          if (currentMeal) currentDay.meals.push(currentMeal);
          plan.days.push(currentDay);
          currentDay = null;
          currentMeal = null;
        }
        currentSection = 'notes';
        inNotes = true;
      }
      // Week/Plan sections
      else if (isSectionHeader(line) && (lowerClean.includes('semana') || lowerClean.includes('menú'))) {
        currentSection = 'meals';
      }
      // List items (starting with - or *)
      else if (/^[-*]\s/.test(line)) {
        const itemText = cleanText(line);
        const lowerItem = itemText.toLowerCase();

        if (currentSection === 'info') {
          const colonIdx = itemText.indexOf(':');
          if (colonIdx > 0) {
            plan.patientInfo.push({
              label: itemText.substring(0, colonIdx).trim(),
              value: itemText.substring(colonIdx + 1).trim(),
            });
          }
        }
        else if (currentSection === 'limits') {
          const colonIdx = itemText.indexOf(':');
          if (colonIdx > 0) {
            plan.limits.push({
              label: itemText.substring(0, colonIdx).trim(),
              value: itemText.substring(colonIdx + 1).trim(),
            });
          }
        }
        else if (currentSection === 'notes' || inNotes) {
          plan.notes.push(itemText);
        }
        else if (currentMeal) {
          // Add item to current meal
          if (lowerItem.includes('nutrición') || lowerItem.includes('sodio') || lowerItem.includes('kcal')) {
            currentMeal.nutrition = itemText;
          } else if (itemText) {
            currentMeal.items.push(itemText);
          }
        }
        else if (currentDay && isMealHeader(itemText)) {
          // Meal name as list item
          if (currentMeal) {
            currentDay.meals.push(currentMeal);
          }
          currentMeal = {
            name: itemText.replace(/:$/, ''),
            items: [],
          };
        }
      }
      // Nested list items or indented content
      else if (/^\s+[-*]\s/.test(line) || /^\s{2,}/.test(line)) {
        const itemText = cleanText(line);
        const lowerItem = itemText.toLowerCase();
        if (currentMeal && itemText) {
          if (lowerItem.includes('nutrición') || lowerItem.includes('sodio') || lowerItem.includes('kcal')) {
            currentMeal.nutrition = itemText;
          } else {
            currentMeal.items.push(itemText);
          }
        }
      }
      // Sub-headers (recipe names) after meal headers - e.g., "### Claras de huevo..."
      else if (currentMeal && line.startsWith('###') && !isMealHeader(cleanLine) && !isDayHeader(line)) {
        // This is a recipe name, add it as first item
        if (cleanLine.length > 3) {
          currentMeal.items.unshift(cleanLine);
        }
      }
      // Plain text after meal header (for formats without list items)
      else if (currentMeal && !isSectionHeader(line) && cleanLine) {
        // Handle inline ingredients and nutrition
        const lowerLine = cleanLine.toLowerCase();
        if (lowerLine.includes('ingredientes:') || lowerLine.includes('nutrición')) {
          // Parse inline content with bold markers
          const parts = cleanLine.split(/\*\*/).filter(p => p.trim());
          for (const part of parts) {
            const trimmed = part.trim();
            if (trimmed.toLowerCase().includes('nutrición') || trimmed.toLowerCase().includes('sodio')) {
              currentMeal.nutrition = trimmed.replace(/^[:\s]+/, '');
            } else if (trimmed.toLowerCase().includes('ingredientes')) {
              // Skip the label "Ingredientes:"
              continue;
            } else if (trimmed.length > 5) {
              currentMeal.items.push(trimmed.replace(/^[:\s]+/, ''));
            }
          }
        }
        // Skip lines that look like headers or are very short
        else if (cleanLine.length > 5 && !cleanLine.endsWith(':')) {
          currentMeal.items.push(cleanLine);
        }
      }
    }

    // Don't forget the last day/meal
    if (currentDay) {
      if (currentMeal) currentDay.meals.push(currentMeal);
      plan.days.push(currentDay);
    }

    return plan;
  };

  const getMealStyle = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('desayuno')) return styles.mealCardBreakfast;
    if (lower.includes('comida') || lower.includes('almuerzo')) return styles.mealCardLunch;
    if (lower.includes('cena')) return styles.mealCardDinner;
    if (lower.includes('colación') || lower.includes('snack') || lower.includes('refrigerio')) return styles.mealCardSnack;
    return styles.mealCardBreakfast;
  };

  const plan = parsePlan(content);

  // Group meals into rows of 2
  const renderMealsForDay = (meals: Meal[]) => {
    const rows: Meal[][] = [];
    for (let i = 0; i < meals.length; i += 2) {
      rows.push(meals.slice(i, i + 2));
    }

    return rows.map((row, rowIdx) => (
      <View key={rowIdx} style={styles.mealsRow}>
        {row.map((meal, mealIdx) => (
          <View key={mealIdx} style={[styles.mealCard, getMealStyle(meal.name)]}>
            <Text style={styles.mealTitle}>{meal.name}</Text>
            {meal.items.map((item, itemIdx) => (
              <Text key={itemIdx} style={styles.mealItem}>• {item}</Text>
            ))}
            {meal.nutrition && (
              <Text style={styles.mealNutrition}>{meal.nutrition}</Text>
            )}
          </View>
        ))}
        {/* Fill empty space if odd number of meals */}
        {row.length === 1 && <View style={{ flex: 1, marginHorizontal: 2 }} />}
      </View>
    ));
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerBrand}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>N+</Text>
            </View>
            <Text style={styles.brandName}>NUTRIRENAL</Text>
          </View>
          <Text style={styles.headerTitle}>{plan.title}</Text>
          <Text style={styles.headerDate}>
            Generado el {new Date().toLocaleDateString('es-MX', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>

        <View style={styles.content}>
          {/* Patient Info */}
          {plan.patientInfo.length > 0 && (
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Información del Paciente</Text>
              <View style={styles.infoGrid}>
                {plan.patientInfo.map((info, idx) => (
                  <View key={idx} style={styles.infoItem}>
                    <Text style={styles.infoLabel}>{info.label}</Text>
                    <Text style={styles.infoValue}>{info.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Nutritional Limits */}
          {plan.limits.length > 0 && (
            <View style={styles.limitsBox}>
              <Text style={styles.limitsTitle}>Límites Diarios Recomendados</Text>
              <View style={styles.limitsGrid}>
                {plan.limits.map((limit, idx) => (
                  <View key={idx} style={styles.limitItem}>
                    <Text style={styles.limitLabel}>{limit.label}</Text>
                    <Text style={styles.limitValue}>{limit.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Days with Meals */}
          {plan.days.map((day, dayIdx) => (
            <View key={dayIdx} style={styles.daySection} wrap={false}>
              <View style={styles.dayHeader}>
                <View style={styles.dayBadge}>
                  <Text style={styles.dayBadgeText}>DÍA {dayIdx + 1}</Text>
                </View>
                <Text style={styles.dayTitle}>{day.name}</Text>
              </View>
              {renderMealsForDay(day.meals)}
            </View>
          ))}

          {/* Notes */}
          {plan.notes.length > 0 && (
            <View style={styles.notesBox} wrap={false}>
              <Text style={styles.notesTitle}>Recordatorio Importante</Text>
              {plan.notes.map((note, idx) => (
                <Text key={idx} style={styles.noteItem}>• {note}</Text>
              ))}
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <View>
            <Text style={styles.footerText}>
              Este plan es una guía general. Consulta con tu especialista.
            </Text>
            <Text style={styles.footerWarning}>
              No sustituye el consejo médico profesional.
            </Text>
          </View>
          <Text style={styles.footerBrand}>NutriRenal</Text>
        </View>
      </Page>
    </Document>
  );
}
