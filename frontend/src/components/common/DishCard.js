import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Chip } from 'react-native-paper';
import { formatCurrency } from '../../utils/helpers';

const DishCard = ({ dish, onPress }) => {
  const { name, description, basePrice, image, isAvailable, variants } = dish;

  // Get the default variant or the first one
  const defaultVariant = variants.find(v => v.isDefault) || variants[0];
  const price = defaultVariant ? defaultVariant.price : basePrice;

  return (
    <TouchableOpacity onPress={onPress} disabled={!isAvailable}>
      <Card style={[styles.card, !isAvailable && styles.unavailable]}>
        {image && (
          <Card.Cover
            source={{ uri: image }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <Title style={styles.title} numberOfLines={1}>{name}</Title>
            <Paragraph style={styles.price}>{formatCurrency(price)}</Paragraph>
          </View>
          <Paragraph numberOfLines={2} style={styles.description}>
            {description}
          </Paragraph>
          {variants.length > 1 && (
            <View style={styles.variantsContainer}>
              {variants.slice(0, 2).map((variant, index) => (
                <Chip key={index} style={styles.variantChip} textStyle={styles.variantText}>
                  {variant.name}
                </Chip>
              ))}
              {variants.length > 2 && (
                <Chip style={styles.variantChip} textStyle={styles.variantText}>
                  +{variants.length - 2} more
                </Chip>
              )}
            </View>
          )}
          {!isAvailable && (
            <View style={styles.unavailableOverlay}>
              <Paragraph style={styles.unavailableText}>Currently Unavailable</Paragraph>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 8,
  },
  unavailable: {
    opacity: 0.7,
  },
  image: {
    height: 150,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b00',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  variantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  variantChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  variantText: {
    fontSize: 12,
  },
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  unavailableText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
});

export default DishCard;
