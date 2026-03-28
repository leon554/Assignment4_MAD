import useColorPalette from '@/hooks/useColorPalette';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Dimensions, FlatList, Keyboard, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

type DropdownProps = {
    options: string[];
    selected: string | null;
    onSelect: (value: string) => void;
    placeholder?: string;
    showSearch?: boolean
};

const { height, width } = Dimensions.get('window');

export const Dropdown: React.FC<DropdownProps> = ({ options, selected, onSelect, placeholder = 'Select an option', showSearch }: DropdownProps) => {
    const animationProgress = useSharedValue(0);
    const borderWidth = useSharedValue(0);
    const isOpen = useSharedValue(false);
    
    const [search, setSearch] = useState("");
    const [isDropDownOpen, setIsDropDownOpen] = useState(false);
    options = options.filter(o => o.includes(search.toLowerCase()));
    
    const toggleDropDown = () => {
        if (isOpen.value) {
            animationProgress.value = withTiming(0, undefined);
            borderWidth.value = withDelay(150, withTiming(0, { duration: 200 }));
            isOpen.value = false;
            setIsDropDownOpen(false);
            setSearch("");
        } else {
            animationProgress.value = withTiming(1);
            borderWidth.value = 1;
            isOpen.value = true;
            setIsDropDownOpen(true);
        }
    };
    
    const handleSelect = (item: string) => {
        onSelect(item);
        toggleDropDown();
    };
    
    const rotationStyle = useAnimatedStyle(() => {
        const rotate = interpolate(animationProgress.value, [0, 1], [0, 180]);
        return {
            transform: [{ rotate: `${rotate}deg` }],
        };
    });
    
    const dropdownContentStyle = useAnimatedStyle(() => {
        return {
            height: interpolate(animationProgress.value, [0, 1], [0, showSearch ? 200 : 120]),
            borderWidth: borderWidth.value,
        };
    });
    
    const colors = useColorPalette()
    const styles = StyleSheet.create({
        container: {
            width: '80%',
        },
        trigger: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 6,
            padding: 8,
            backgroundColor: colors.surface,
            height: 40,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        triggerText: {
            color: colors.textPrimary,
            textTransform: 'capitalize',
            paddingRight: 4,
        },
        backdrop: {
            position: 'absolute',
            zIndex: 10,
            backgroundColor: 'transparent',
        },
        dropdownContent: {
            position: 'absolute',
            top: 48,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
            zIndex: 50,
            width: '100%',
            overflow: 'hidden',
        },
        searchRow: {
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            flexDirection: 'row',
            alignItems: 'center',
            paddingLeft: 12,
        },
        searchIcon: {
            marginTop: 1,
        },
        searchInput: {
            flex: 1,
            padding: 12,
            color: colors.textSecondary,
            fontWeight: '500',
            fontSize: 14,
        },
        option: {
            padding: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        optionText: {
            color: colors.textSecondary,
            textTransform: 'capitalize',
            fontSize: 12,
            fontWeight: '500',
        },
        emptyText: {
            width: '100%',
            padding: 12,
            fontSize: 14,
        },
    });

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.trigger}
                onPress={toggleDropDown}
                activeOpacity={0.7}
            >
                <Text style={styles.triggerText}>{selected || placeholder}</Text>
                <Animated.View style={rotationStyle}>
                    <Ionicons name="caret-down" size={15} color={colors.textPrimary}/>
                </Animated.View>
            </TouchableOpacity>

            {isDropDownOpen &&
                <Pressable
                    onPress={() => {
                        toggleDropDown();
                        Keyboard.dismiss();
                    }}
                    style={[styles.backdrop, { top: -height, left: -width, width: width * 3, height: height * 3 }]}
                />
            }

            <Animated.View
                style={[styles.dropdownContent, dropdownContentStyle]}
            >
                {showSearch &&
                    <View style={styles.searchRow}>
                        <Ionicons name="search" size={12}  color="hsl(0, 0%, 55%)" style={styles.searchIcon}
                        />
                        <TextInput
                            style={styles.searchInput}
                            placeholder='Search...'
                            placeholderTextColor={"hsl(0, 0%, 55%)"}
                            value={search}
                            onChangeText={e => setSearch(e)}
                        />
                    </View>
                }
                <FlatList
                    data={options}
                    keyExtractor={(item, index) => `${item}-${index}`}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => handleSelect(item)}
                        >
                            <Text style={styles.optionText}>{item}</Text>
                        </TouchableOpacity>
                    )}
                    scrollEnabled={true}
                    ListEmptyComponent={
                        <Text style={[styles.optionText, styles.emptyText]}>
                            No Result
                        </Text>
                    }
                />
            </Animated.View>
        </View>
    );
};

