package com.medicare.platform.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class LoginRequestDto {

    @NotBlank(message = "L'identifiant est obligatoire")
    @Size(max = 50, message = "L'identifiant ne peut pas dépasser 50 caractères")
    private String username;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(max = 200, message = "Le mot de passe ne peut pas dépasser 200 caractères")
    private String password;

    public LoginRequestDto() {
    }

    public LoginRequestDto(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
