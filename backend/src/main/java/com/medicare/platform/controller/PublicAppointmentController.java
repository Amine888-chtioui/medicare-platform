package com.medicare.platform.controller;

import com.medicare.platform.dto.request.CreateAppointmentRequestDto;
import com.medicare.platform.dto.response.ApiResponse;
import com.medicare.platform.dto.response.AppointmentResponseDto;
import com.medicare.platform.security.ClientIpResolver;
import com.medicare.platform.security.PublicRequestRateLimiter;
import com.medicare.platform.service.AppointmentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/appointment-requests")
public class PublicAppointmentController {

    private final AppointmentService appointmentService;
    private final PublicRequestRateLimiter rateLimiter;
    private final ClientIpResolver clientIpResolver;

    public PublicAppointmentController(
            AppointmentService appointmentService,
            PublicRequestRateLimiter rateLimiter,
            ClientIpResolver clientIpResolver
    ) {
        this.appointmentService = appointmentService;
        this.rateLimiter = rateLimiter;
        this.clientIpResolver = clientIpResolver;
    }

    /**
     * Endpoint public permettant aux patientes de soumettre une demande de rendez-vous.
     * Une limite anti-spam par adresse IP protège le formulaire.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> createAppointment(
            @Valid @RequestBody CreateAppointmentRequestDto dto,
            HttpServletRequest request) {
        String clientIp = clientIpResolver.resolve(request);
        rateLimiter.checkAllowed(clientIp);

        AppointmentResponseDto created = appointmentService.createAppointment(dto);
        rateLimiter.recordRequest(clientIp);

        ApiResponse<AppointmentResponseDto> response = ApiResponse.success(
                "Votre demande de rendez-vous a bien été enregistrée. Le cabinet vous contactera prochainement.",
                created
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
