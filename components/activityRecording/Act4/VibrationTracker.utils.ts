export function magnitude(x: number, y: number, z: number): number {
    return Math.sqrt(x * x + y * y + z * z);
}

export function barColor(m: number): string {
    const g = m / 9.81;
    if (g < 0.3) return "#4caf50";
    if (g < 1.0) return "#ff9800";
    return "#f44336";
}

export function barPercent(liveMag: number): number {
    return Math.min(100, (liveMag / 30) * 100);
}
