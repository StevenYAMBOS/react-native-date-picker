import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const DatePicker: React.FC<DatePickerProps> = ({
    value,
    onChange,
    height,
    width,
    fontSize,
    textColor,
    startYear,
    endYear,
    markColor,
    markHeight,
    markWidth,
    fadeColor,
    format,
    language,
    mode
}) => {
    const [days, setDays] = useState<number[]>([]);
    const [months, setMonths] = useState<string[]>([]);
    const [years, setYears] = useState<number[]>([]);
    const [hours, setHours] = useState<number[]>([]);
    const [minutes, setMinutes] = useState<number[]>([]);

    const monthNames: { [key: string]: string[] } = {
        fr: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
        en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    };

    useEffect(() => {
        const end = endYear || new Date().getFullYear();
        const start = !startYear || startYear > end ? (end - 100) : startYear;

        const _days = [...Array(31)].map((_, index) => index + 1);
        const _months = monthNames[language || "fr"];
        const _years = [...Array(end - start + 1)].map((_, index) => start + index);
        const _hours = [...Array(24)].map((_, index) => index);
        const _minutes = [...Array(60)].map((_, index) => index);

        setDays(_days);
        setMonths(_months);
        setYears(_years);
        setHours(_hours);
        setMinutes(_minutes);
    }, [language, startYear, endYear]);

    const pickerHeight: number = Math.round(height || Dimensions.get("window").height / 3.5);
    const pickerWidth: number | string = width || "100%";

    const unexpectedDate: Date = new Date(years[0], 0, 1);
    const date = new Date(value || unexpectedDate);

    const changeHandle = (type: string, digit: number | string): void => {
        switch (type) {
            case "day":
                date.setDate(digit as number);
                break;
            case "month":
                date.setMonth(monthNames[language || "fr"].indexOf(digit as string));
                break;
            case "year":
                date.setFullYear(digit as number);
                break;
            case "hour":
                date.setHours(digit as number);
                break;
            case "minute":
                date.setMinutes(digit as number);
                break;
        }

        onChange(date);
    };

    const getOrder = () => {
        if (mode === "time") {
            return [
                { name: "hour", digits: hours, value: date.getHours() },
                { name: "minute", digits: minutes, value: date.getMinutes() }
            ];
        }

        return (format || "dd-mm-yyyy").split("-").map((type, index) => {
            switch (type) {
                case "dd":
                    return { name: "day", digits: days, value: date.getDate() };
                case "mm":
                    return { name: "month", digits: months, value: monthNames[language || "fr"][date.getMonth()] };
                case "yyyy":
                    return { name: "year", digits: years, value: date.getFullYear() };
                default:
                    console.warn(`Invalid date picker format prop: found "${type}" in ${format}. Please read documentation!`);
                    return {
                        name: ["day", "month", "year"][index],
                        digits: [days, months, years][index],
                        value: [date.getDate(), monthNames[language || "fr"][date.getMonth()], date.getFullYear()][index]
                    };
            }
        });
    };

    return (
        <View style={[styles.picker, { height: pickerHeight, width: pickerWidth }]}>
            {getOrder().map((el, index) => (
                <DateBlock
                    digits={el.digits}
                    value={el.value}
                    onChange={changeHandle}
                    height={pickerHeight}
                    fontSize={fontSize}
                    textColor={textColor}
                    markColor={markColor}
                    markHeight={markHeight}
                    markWidth={markWidth}
                    fadeColor={fadeColor}
                    type={el.name}
                    key={index}
                />
            ))}
        </View>
    );
};

const DateBlock: React.FC<DateBlockProps> = ({
    value,
    digits,
    type,
    onChange,
    height,
    fontSize,
    textColor,
    markColor,
    markHeight,
    markWidth,
    fadeColor,
}) => {
    const dHeight: number = Math.round(height / 4);
    const mHeight: number = markHeight || Math.min(dHeight, 65);
    const mWidth: number | string = markWidth || "70%";
    const offsets = digits.map((_: number | string, index: number) => index * dHeight);
    const fadeFilled: string = hex2rgba(fadeColor || "#ffffff", 1);
    const fadeTransparent: string = hex2rgba(fadeColor || "#ffffff", 0);
    const scrollRef = useRef<any>(null);

    const snapScrollToIndex = (index: number) => {
        scrollRef?.current?.scrollTo({ y: dHeight * index, animated: true });
    };

    useEffect(() => {
        snapScrollToIndex(digits.indexOf(value));
    }, [scrollRef.current]);

    const handleMomentumScrollEnd = ({ nativeEvent }: any) => {
        const digit = Math.round(nativeEvent.contentOffset.y / dHeight);
        onChange(type, digits[digit]);
    };

    return (
        <View style={styles.block}>
            <View
                style={[
                    styles.mark,
                    {
                        top: (height - mHeight) / 2,
                        backgroundColor: markColor || "rgba(0, 0, 0, 0.05)",
                        height: mHeight,
                        width: mWidth,
                        borderTopColor: "#A374FF30",
                        borderBottomColor: "#A374FF30",
                        borderTopWidth: 1,
                        borderBottomWidth: 1,
                    }
                ]}
            />
            <ScrollView
                ref={scrollRef}
                style={styles.scroll}
                snapToOffsets={offsets}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={0}
                onMomentumScrollEnd={handleMomentumScrollEnd}
            >
                {digits.map((digit: number | string, index: number) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => {
                            onChange(type, digit);
                            snapScrollToIndex(index);
                        }}
                    >
                        <View style={[styles.digitContainer, { height: dHeight }]}>
                            <Text
                                style={[
                                    styles.digit,
                                    {
                                        fontSize: fontSize || 22,
                                        color: textColor || "#000000",
                                    }
                                ]}
                            >
                                {digit}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <LinearGradient
                style={[styles.gradient, { bottom: 0, height: height / 4 }]}
                colors={[fadeTransparent, fadeFilled]}
                pointerEvents={"none"}
            />
            <LinearGradient
                style={[styles.gradient, { top: 0, height: height / 4 }]}
                colors={[fadeFilled, fadeTransparent]}
                pointerEvents={"none"}
            />
        </View>
    );
};

const hex2rgba = (hex: string, alpha: number): string => {
    hex = hex.replace("#", "");
    const r: number = parseInt(hex.length === 3 ? hex.slice(0, 1).repeat(2) : hex.slice(0, 2), 16);
    const g: number = parseInt(hex.length === 3 ? hex.slice(1, 2).repeat(2) : hex.slice(2, 4), 16);
    const b: number = parseInt(hex.length === 3 ? hex.slice(2, 3).repeat(2) : hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const styles = StyleSheet.create({
    picker: {
        flexDirection: "row",
        width: "100%",
    },
    block: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
    },
    scroll: {
        width: "100%",
    },
    digitContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    digit: {
        textAlign: "center",
    },
    mark: {
        position: "absolute",
        borderRadius: 10,
    },
    gradient: {
        position: "absolute",
        width: "100%",
    },
});

export default DatePicker;
