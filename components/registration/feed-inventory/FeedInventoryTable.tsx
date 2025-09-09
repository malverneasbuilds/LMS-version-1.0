import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '../../typography/Text';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Plus, CreditCard as Edit, Trash2, TrendingDown, TriangleAlert as AlertTriangle, Eye } from 'lucide-react-native';
import Colors from '../../../constants/Colors';
import { useFeedInventory, FeedInventoryRecord } from '../../../contexts/FeedInventoryContext';
import { FeedConsumptionModal } from './FeedConsumptionModal';

interface FeedInventoryTableProps {
  data: FeedInventoryRecord[];
  onAdd: () => void;
  onEdit: (record: FeedInventoryRecord) => void;
  onDelete: (id: string) => void;
}

export function FeedInventoryTable({ data, onAdd, onEdit, onDelete }: FeedInventoryTableProps) {
  const { getConsumptionHistory, getMonthlyConsumption } = useFeedInventory();
  const [consumptionModalVisible, setConsumptionModalVisible] = useState(false);
  const [selectedFeedItem, setSelectedFeedItem] = useState<FeedInventoryRecord | null>(null);

  // Calculate monthly consumption for current month
  const getCurrentMonthConsumption = (feedId: string): number => {
    const now = new Date();
    return getMonthlyConsumption(feedId, now.getFullYear(), now.getMonth() + 1);
  };

  // Check if stock is low
  const isStockLow = (item: FeedInventoryRecord): boolean => {
    return item.current_stock <= item.minimum_stock_level && item.minimum_stock_level > 0;
  };

  // Check if item is expired or expiring soon
  const getExpiryStatus = (expiryDate: string): 'expired' | 'expiring' | 'good' => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring';
    return 'good';
  };

  const handleRecordConsumption = (item: FeedInventoryRecord) => {
    setSelectedFeedItem(item);
    setConsumptionModalVisible(true);
  };

  const handleViewHistory = (item: FeedInventoryRecord) => {
    // This could open a detailed consumption history modal
    console.log('View consumption history for:', item.feed_type);
  };

  const renderTable = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.table}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <Text variant="caption" weight="medium" style={[styles.cell, styles.feedTypeCell]}>
            Feed Type
          </Text>
          <Text variant="caption" weight="medium" style={[styles.cell, styles.brandCell]}>
            Brand
          </Text>
          <Text variant="caption" weight="medium" style={[styles.cell, styles.categoryCell]}>
            Category
          </Text>
          <Text variant="caption" weight="medium" style={[styles.cell, styles.stockCell]}>
            Current Stock
          </Text>
          <Text variant="caption" weight="medium" style={[styles.cell, styles.consumptionCell]}>
            Monthly Consumption
          </Text>
          <Text variant="caption" weight="medium" style={[styles.cell, styles.supplierCell]}>
            Supplier
          </Text>
          <Text variant="caption" weight="medium" style={[styles.cell, styles.expiryCell]}>
            Expiry Date
          </Text>
          <Text variant="caption" weight="medium" style={[styles.cell, styles.statusCell]}>
            Status
          </Text>
          <Text variant="caption" weight="medium" style={[styles.cell, styles.actionsCell]}>
            Actions
          </Text>
        </View>

        {/* Data Rows */}
        {data.map((item, index) => {
          const monthlyConsumption = getCurrentMonthConsumption(item.id);
          const expiryStatus = getExpiryStatus(item.expiry_date);
          const stockLow = isStockLow(item);

          return (
            <View 
              key={item.id} 
              style={[
                styles.dataRow,
                index === data.length - 1 && styles.lastRow
              ]}
            >
              <Text variant="body2" style={[styles.cell, styles.feedTypeCell]}>
                {item.feed_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
              <Text variant="body2" style={[styles.cell, styles.brandCell]}>
                {item.brand}
              </Text>
              <Text variant="body2" style={[styles.cell, styles.categoryCell]}>
                {item.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
              <View style={[styles.cell, styles.stockCell]}>
                <Text 
                  variant="body2" 
                  color={stockLow ? 'error.600' : 'neutral.800'}
                  weight={stockLow ? 'medium' : 'regular'}
                >
                  {item.current_stock} {item.unit}
                </Text>
                {stockLow && (
                  <AlertTriangle size={12} color={Colors.error[500]} style={styles.warningIcon} />
                )}
              </View>
              <Text variant="body2" style={[styles.cell, styles.consumptionCell]}>
                {monthlyConsumption.toFixed(1)} {item.unit}
              </Text>
              <Text variant="body2" style={[styles.cell, styles.supplierCell]}>
                {item.supplier || '-'}
              </Text>
              <Text 
                variant="body2" 
                style={[styles.cell, styles.expiryCell]}
                color={
                  expiryStatus === 'expired' ? 'error.600' :
                  expiryStatus === 'expiring' ? 'warning.600' : 'neutral.800'
                }
              >
                {item.expiry_date}
              </Text>
              <View style={[styles.cell, styles.statusCell]}>
                <View style={styles.statusIndicators}>
                  {stockLow && (
                    <View style={[styles.statusBadge, styles.lowStockBadge]}>
                      <Text variant="caption" color="error.700" weight="medium">
                        LOW
                      </Text>
                    </View>
                  )}
                  {expiryStatus === 'expired' && (
                    <View style={[styles.statusBadge, styles.expiredBadge]}>
                      <Text variant="caption" color="error.700" weight="medium">
                        EXPIRED
                      </Text>
                    </View>
                  )}
                  {expiryStatus === 'expiring' && (
                    <View style={[styles.statusBadge, styles.expiringBadge]}>
                      <Text variant="caption" color="warning.700" weight="medium">
                        EXPIRING
                      </Text>
                    </View>
                  )}
                  {!stockLow && expiryStatus === 'good' && (
                    <View style={[styles.statusBadge, styles.goodBadge]}>
                      <Text variant="caption" color="success.700" weight="medium">
                        GOOD
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={[styles.cell, styles.actionsCell]}>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.consumptionButton]}
                    onPress={() => handleRecordConsumption(item)}
                  >
                    <TrendingDown size={12} color={Colors.white} />
                    <Text variant="caption" color="white" style={styles.buttonText}>
                      Record
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => onEdit(item)}
                  >
                    <Edit size={12} color={Colors.primary[500]} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => onDelete(item.id)}
                  >
                    <Trash2 size={12} color={Colors.error[500]} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );

  return (
    <>
      <Card style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text variant="h6" weight="medium">
              Feed Inventory
            </Text>
            <Text variant="caption" color="neutral.600">
              {data.length} items tracked
            </Text>
          </View>
          <Button
            variant="primary"
            size="sm"
            startIcon={<Plus size={16} color={Colors.white} />}
            onPress={onAdd}
          >
            Add Feed
          </Button>
        </View>
        
        {data.length > 0 ? (
          renderTable()
        ) : (
          <View style={styles.emptyState}>
            <Text variant="body" color="neutral.500">
              No feed inventory found. Add your first feed item to get started.
            </Text>
          </View>
        )}
      </Card>

      <FeedConsumptionModal
        visible={consumptionModalVisible}
        onClose={() => setConsumptionModalVisible(false)}
        feedItem={selectedFeedItem}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 8,
    overflow: 'hidden',
    minWidth: 1000,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[100],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  dataRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  cell: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  feedTypeCell: {
    width: 120,
  },
  brandCell: {
    width: 100,
  },
  categoryCell: {
    width: 100,
  },
  stockCell: {
    width: 120,
    flexDirection: 'row',
    alignItems: 'center',
  },
  consumptionCell: {
    width: 140,
  },
  supplierCell: {
    width: 100,
  },
  expiryCell: {
    width: 100,
  },
  statusCell: {
    width: 100,
  },
  actionsCell: {
    width: 180,
  },
  warningIcon: {
    marginLeft: 4,
  },
  statusIndicators: {
    flexDirection: 'column',
    gap: 2,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lowStockBadge: {
    backgroundColor: Colors.error[100],
  },
  expiredBadge: {
    backgroundColor: Colors.error[100],
  },
  expiringBadge: {
    backgroundColor: Colors.warning[100],
  },
  goodBadge: {
    backgroundColor: Colors.success[100],
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 2,
  },
  consumptionButton: {
    backgroundColor: Colors.warning[500],
  },
  editButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary[500],
  },
  deleteButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.error[500],
  },
  buttonText: {
    fontSize: 10,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});