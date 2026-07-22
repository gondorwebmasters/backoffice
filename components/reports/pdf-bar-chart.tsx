import { StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    width: 70,
    fontSize: 8,
    color: "#52525B",
  },
  track: {
    flex: 1,
    height: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    overflow: "hidden",
  },
  bar: {
    height: 10,
    borderRadius: 3,
  },
  value: {
    width: 44,
    fontSize: 8,
    color: "#18181B",
    textAlign: "right",
  },
});

interface PdfBarChartProps {
  data: { label: string; value: number }[];
  formatValue?: (value: number) => string;
  color?: string;
}

/** Listado con barra horizontal por fila (label + track + valor), tal como estaba antes de incorporar los charts de `@react-pdf/renderer`. */
export function PdfBarChart({ data, formatValue, color = "#EF4444" }: PdfBarChartProps) {
  const max = Math.max(1, ...data.map((item) => item.value));
  const format = formatValue ?? ((value: number) => String(value));

  return (
    <View>
      {data.map((item) => (
        <View key={item.label} style={styles.row}>
          <Text style={styles.label}>{item.label}</Text>
          <View style={styles.track}>
            <View style={[styles.bar, { width: `${(item.value / max) * 100}%`, backgroundColor: color }]} />
          </View>
          <Text style={styles.value}>{format(item.value)}</Text>
        </View>
      ))}
    </View>
  );
}
