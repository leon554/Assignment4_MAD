// Unit Test 
// Tests the rating validation logic from ActRatingComment

describe('Rating Validation', () => {
    function isNumberBetweenOneAndFive(value: string): boolean {
        const num = Number(value);
        return Number.isInteger(num) && num >= 1 && num <= 5;
    }

    test('returns true for valid rating of 3', () => {
        expect(isNumberBetweenOneAndFive('3')).toBe(true);
    });

    test('returns false for rating of 0', () => {
        expect(isNumberBetweenOneAndFive('0')).toBe(false);
    });

    test('returns false for rating of 6', () => {
        expect(isNumberBetweenOneAndFive('6')).toBe(false);
    });

    test('returns false for non-numeric input', () => {
        expect(isNumberBetweenOneAndFive('abc')).toBe(false);
    });

    test('returns false for empty string', () => {
        expect(isNumberBetweenOneAndFive('')).toBe(false);
    });

    test('returns true for rating of 1', () => {
        expect(isNumberBetweenOneAndFive('1')).toBe(true);
    });

    test('returns true for rating of 5', () => {
        expect(isNumberBetweenOneAndFive('5')).toBe(true);
    });
});
