import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFreezerStorageContext } from '@/hooks/FreezerStorageProvider';
import { useGlobalUpdate } from '@/hooks/useGlobalUpdate';
import { calculateFreezerHeatLoad } from '@/utils/calculations';
import { generateAndSharePDF, PDFData } from '@/utils/pdfGenerator';

export default function FreezerResultsTab() {
  const { roomData, productData, miscData } = useFreezerStorageContext();

  // Subscribe to global updates for real-time calculation
  useGlobalUpdate();

  const results = calculateFreezerHeatLoad(roomData, productData, miscData);

  const handleSharePDF = async () => {
    const pdfData: PDFData = {
      title: 'Freezer Room Heat Load Summary',
      subtitle: 'Key calculation results for freezer room refrigeration system',
      inputs: [
        {
          title: 'Ambient Conditions',
          items: [
            { label: 'Ambient Temperature', value: roomData.ambientTemp.toString(), unit: `°${roomData.tempUnit}` },
            { label: 'Ambient RH', value: '60', unit: '%' },
          ]
        },
        {
          title: 'Room Definition',
          items: [
            { label: 'Room Length', value: roomData.length.toString(), unit: roomData.lengthUnit },
            { label: 'Room Width', value: roomData.width.toString(), unit: roomData.lengthUnit },
            { label: 'Room Height', value: roomData.height.toString(), unit: roomData.lengthUnit },
            { label: 'Insulation Thickness', value: roomData.wallInsulationThickness.toString(), unit: 'mm' },
            { label: 'Room Internal Volume', value: (roomData.length * roomData.width * roomData.height).toFixed(2), unit: 'm³' },
            { label: 'Cold Room Position', value: 'Inside', unit: '' },
            { label: 'Room Temperature', value: roomData.roomTemp.toString(), unit: `°${roomData.tempUnit}` },
            { label: 'Insulation', value: roomData.insulationType, unit: '40 kg/m³' },
          ]
        },
        {
          title: 'Product Definition',
          items: [
            { label: 'Product', value: 'Product', unit: '' },
            { label: 'Product Quantity', value: miscData.capacityRequired?.toString() || '0', unit: 'kg' },
            { label: 'Daily Product Loading', value: miscData.capacityRequired?.toString() || '0', unit: 'kg' },
            { label: 'Product Incoming Temp', value: productData.productEnteringTemp.toString(), unit: `°${productData.tempUnit}` },
            { label: 'Product Final Temp', value: productData.productFinalTemp.toString(), unit: `°${productData.tempUnit}` },
            { label: 'Specific Heat Above Freezing', value: productData.cpAboveFreezing.toString(), unit: 'kJ/kg °C' },
            { label: 'Specific Heat Below Freezing', value: productData.cpBelowFreezing.toString(), unit: 'kJ/kg °C' },
            { label: 'Freezing Temp', value: productData.freezingTemp.toString(), unit: `°${productData.tempUnit}` },
            { label: 'Latent Heat of Freezing', value: productData.latentHeat.toString(), unit: 'kJ/kg' },
            { label: 'Respiration Heat', value: '0.00', unit: 'W/kg * 24 h' },
          ]
        },
        {
          title: 'Internal Factors',
          items: [
            { label: 'No. of Workers', value: miscData.occupancyCount?.toString() || '0', unit: '' },
            { label: 'Rated Power of motors', value: miscData.fanMotorRating?.toString() || '0', unit: 'W' },
            { label: 'Lightings', value: miscData.lightPower?.toString() || '0', unit: 'W' },
            { label: 'Heater Coils', value: '0', unit: 'W' },
            { label: 'Working Time', value: '5', unit: 'h' },
            { label: 'Operating Time 1', value: miscData.equipmentUsageHours?.toString() || '20', unit: 'h' },
            { label: 'Operating Time 2', value: '6', unit: 'h' },
            { label: 'Operating Time 3', value: '0', unit: 'h' },
          ]
        }
      ],
      sections: [
        {
          title: 'Heat Load Results',
          items: [
            { label: 'Transmission Load in 24h', value: (results.totalTransmissionLoad / 3600).toFixed(2), unit: 'kW', isHighlighted: true },
            { label: 'Product Load in 24h', value: (results.totalProductLoad / 3600).toFixed(2), unit: 'kW', isHighlighted: true },
            { label: 'Infiltration Load in 24h', value: (results.airChangeLoad / 3600).toFixed(2), unit: 'kW', isHighlighted: true },
            { label: 'Internal Load in 24h', value: (results.totalMiscLoad / 3600).toFixed(2), unit: 'kW', isHighlighted: true },
            { label: 'Safety Factor', value: '20', unit: '%' },
            { label: 'Cooling Time', value: '24.00', unit: 'h' },
            { label: 'Equipment Operating Time', value: miscData.equipmentUsageHours?.toString() || '20', unit: 'h' },
            { label: 'Hourly Equipment Load', value: results.loadInKw.toFixed(2), unit: 'kW', isHighlighted: true },
          ]
        }
      ]
    };

    await generateAndSharePDF(pdfData);
  };

  const ResultCard = ({ title, value, unit, isHighlighted = false }: {
    title: string;
    value: number;
    unit: string;
    isHighlighted?: boolean;
  }) => (
    <View style={[styles.resultCard, isHighlighted && styles.highlightedCard]}>
      <Text style={[styles.resultLabel, isHighlighted && styles.highlightedLabel]}>{title}</Text>
      <Text style={[styles.resultValue, isHighlighted && styles.highlightedValue]}>
        {value.toFixed(1)} <Text style={styles.resultUnit}>{unit}</Text>
      </Text>
    </View>
  );

  const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Enzo Cool Calc</Text>
            <Text style={styles.subtitle}>Freezer Heat Load Results</Text>

            {/* PDF Export Button */}
            <TouchableOpacity style={styles.pdfButton} onPress={handleSharePDF}>
              <Ionicons name="document-text-outline" size={20} color="#ffffff" />
              <Text style={styles.pdfButtonText}>Share as PDF</Text>
            </TouchableOpacity>
          </View>

        {/* Main Results - Highlighted */}
        <SectionCard title="Main Results">
          <ResultCard
            title="Total Load (with 20% Safety)"
            value={results.capacityTR * 3.517}
            unit="kW"
            isHighlighted={true}
          />
          <ResultCard
            title="Refrigeration Capacity (with 20% Safety)"
            value={results.capacityTR}
            unit="TR"
            isHighlighted={true}
          />
          <ResultCard
            title="Base Load (without safety)"
            value={results.loadInKw}
            unit="kW"
            isHighlighted={true}
          />
          <ResultCard
            title="Base Refrigeration Capacity"
            value={results.totalLoadTR}
            unit="TR"
            isHighlighted={true}
          />
        </SectionCard>

        {/* Transmission Loads */}
        <SectionCard title="Transmission Loads">
          <ResultCard title="Wall Load" value={results.wallLoad} unit="kW" />
          <ResultCard title="Ceiling Load" value={results.ceilingLoad} unit="kW" />
          <ResultCard title="Floor Load" value={results.floorLoad} unit="kW" />
          <ResultCard
            title="Total Transmission Load"
            value={results.totalTransmissionLoad}
            unit="kW"
          />
        </SectionCard>

        {/* Product Loads - Freezer Specific */}
        <SectionCard title="Product Loads (Freezing Process)">
          <ResultCard
            title="Before Freezing Load"
            value={results.beforeFreezingLoad}
            unit="kW"
          />
          <ResultCard
            title="Latent Heat Load (Freezing)"
            value={results.latentHeatLoad}
            unit="kW"
          />
          <ResultCard
            title="After Freezing Load"
            value={results.afterFreezingLoad}
            unit="kW"
          />
          <ResultCard
            title="Total Product Load"
            value={results.totalProductLoad}
            unit="kW"
          />
        </SectionCard>

        {/* Other Loads */}
        <SectionCard title="Other Loads">
          <ResultCard title="Respiration Load" value={results.respirationLoad} unit="kW" />
          <ResultCard title="Air Change Load" value={results.airChangeLoad} unit="kW" />
          <ResultCard title="Equipment Load" value={results.equipmentLoad} unit="kW" />
          <ResultCard title="Lighting Load" value={results.lightLoad} unit="kW" />
          <ResultCard title="Heater Load" value={results.heaterLoad} unit="kW" />
          <ResultCard title="Occupancy Load" value={results.occupancyLoad} unit="kW" />
          <ResultCard
            title="Total Miscellaneous Load"
            value={results.totalMiscLoad}
            unit="kW"
          />
        </SectionCard>

        {/* Heat Distribution */}
        <SectionCard title="Heat Distribution">
          <ResultCard title="Sensible Heat" value={results.sensibleHeat} unit="kW" />
          <ResultCard title="Latent Heat" value={results.latentHeat} unit="kW" />
          <ResultCard title="Air Quantity Required" value={results.airQtyRequired} unit="CFM" />
        </SectionCard>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by Enzo</Text>
          <Text style={styles.footerSubtext}>
            Professional freezer heat load calculations following ASHRAE standards
          </Text>
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 12,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '400',
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#2563eb',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pdfButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 10,
    letterSpacing: -0.1,
  },
  resultCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    minHeight: 40,
  },
  highlightedCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 3,
    borderBottomWidth: 0,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  resultLabel: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
    fontWeight: '400',
  },
  highlightedLabel: {
    fontWeight: '600',
    color: '#1e40af',
    fontSize: 14,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  highlightedValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  resultUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: '#64748b',
  },
  footer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '600',
    marginBottom: 3,
  },
  footerSubtext: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '400',
  },
});
