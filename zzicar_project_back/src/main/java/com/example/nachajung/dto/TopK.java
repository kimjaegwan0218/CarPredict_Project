package com.example.nachajung.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TopK {
    private String modelName;
    private double confidence;
}