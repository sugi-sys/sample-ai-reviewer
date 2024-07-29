package com.github.sugi_sys.sample_ai_reviewer.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import com.github.sugi_sys.sample_ai_reviewer.configure.ThemeProperties;

@Controller
@RequestMapping("/")
public class IndexController {
    private final List<String> THEME_1;
    private final List<String> THEME_2;

    public IndexController(ThemeProperties themeProperties) {
        this.THEME_1 = themeProperties.getTheme1();
        this.THEME_2 = themeProperties.getTheme2();
    }

    @RequestMapping("/")
    public String index(Model model) {
        model.addAttribute("theme1", THEME_1);
        model.addAttribute("theme2", THEME_2);
        return "index";
    }
}
