package com.medicare.platform.dto.response;

import java.time.LocalDate;

/**
 * Nombre de demandes reçues pour un jour donné.
 * Utilisé par le graphique du tableau de bord (données réelles MySQL).
 */
public class DailyStatsDto {

    private LocalDate date;
    private long count;

    public DailyStatsDto() {
    }

    public DailyStatsDto(LocalDate date, long count) {
        this.date = date;
        this.count = count;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}
