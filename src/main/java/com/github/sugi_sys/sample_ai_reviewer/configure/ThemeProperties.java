package com.github.sugi_sys.sample_ai_reviewer.configure;

import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * application.ymlにおけるリスト構造のデータをSpringで取り扱う際のお作法クラス。
 */
@Component
@ConfigurationProperties(prefix = "spring.theme")
public class ThemeProperties {
    private final List<String> theme1 = new ArrayList<>();
    private final List<String> theme2 = new ArrayList<>();

    public List<String> getTheme1() {
        return theme1;
    }

    public List<String> getTheme2() {
        return theme2;
    }
}
