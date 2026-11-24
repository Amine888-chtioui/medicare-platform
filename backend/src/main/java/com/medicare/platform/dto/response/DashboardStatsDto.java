package com.medicare.platform.dto.response;

public class DashboardStatsDto {

    private long total;
    private long enAttente;
    private long confirmees;
    private long refusees;

    public DashboardStatsDto() {
    }

    public DashboardStatsDto(long total, long enAttente, long confirmees, long refusees) {
        this.total = total;
        this.enAttente = enAttente;
        this.confirmees = confirmees;
        this.refusees = refusees;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public long getEnAttente() {
        return enAttente;
    }

    public void setEnAttente(long enAttente) {
        this.enAttente = enAttente;
    }

    public long getConfirmees() {
        return confirmees;
    }

    public void setConfirmees(long confirmees) {
        this.confirmees = confirmees;
    }

    public long getRefusees() {
        return refusees;
    }

    public void setRefusees(long refusees) {
        this.refusees = refusees;
    }
}
