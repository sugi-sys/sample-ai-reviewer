package com.github.sugi_sys.sample_ai_reviewer.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.github.sugi_sys.sample_ai_reviewer.configure.ThemeProperties;

@RestController
@RequestMapping("/api")
public class ApiController {

    private final OpenAiChatModel CHAT_MODEL;

    private final String SYSTEM_MESSAGE;

    private final String GENERATE_ORDER;

    private final String SUBMIT_ORDER;

    private final ThemeProperties THEME_PROPERTIES;

    public ApiController(
            OpenAiChatModel chatModel,
            @Value("${spring.generate-order}") String GenerateOrder,
            @Value("${spring.system}") String systemMessage,
            @Value("${spring.submit-order}") String submitOrder,
            ThemeProperties themeProperties) {
        CHAT_MODEL = chatModel;
        GENERATE_ORDER = GenerateOrder;
        SYSTEM_MESSAGE = systemMessage;
        SUBMIT_ORDER = submitOrder;
        THEME_PROPERTIES = themeProperties;
    }

    /**
     * 問題生成用のAPI。テーマ指定が0の場合はランダム選択のための処理を行う。問題生成元のテーマ、規定の問題生成命令文をListに連ねた上で、問題文の生成命令を送る。
     * @param reqJson JSONでのリクエストボディをMap構造に変換したもの。theme1とtheme2をそれぞれindexの数値で受け取る。
     * @return 生成されたメッセージ（問題文）とメッセージの種別（ロール）と生成に使用したテーマ情報2つをJSON用にMap型として返す。
     */
    @PostMapping("/generate")
    public Map<String, String> generate(@RequestBody Map<String, String> reqJson) {
        String theme1 = null;
        String theme2 = null;
        try {
            int theme1Index = Integer.parseInt(reqJson.get("theme1"));
            int theme2Index = Integer.parseInt(reqJson.get("theme2"));

            if (theme1Index == 0) {
                theme1Index = randomizeTheme(THEME_PROPERTIES.getTheme1());
            }
            if (theme2Index == 0) {
                theme2Index = randomizeTheme(THEME_PROPERTIES.getTheme2());
            }

            theme1 = THEME_PROPERTIES.getTheme1().get(theme1Index);
            theme2 = THEME_PROPERTIES.getTheme2().get(theme2Index);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        List<Message> messageList = generateMessageList(theme1, theme2);

        AssistantMessage assistantMessage = call(messageList);

        Map<String, String> resJson = new HashMap<>();
        resJson.put("role", assistantMessage.getMessageType().getValue());
        resJson.put("content", assistantMessage.getContent());
        resJson.put("theme1", theme1);
        resJson.put("theme2", theme2);

        return resJson;
    }

    /**
     * レビュー生成用のAPI。問題生成元のテーマ、規定の問題生成命令文、AIが生成した問題文、ユーザーの回答文をListに連ねた上で、レビュー文の生成命令を送る。
     * @param reqJson JSONでのリクエストボディをMap構造に変換したもの。theme1とtheme2をそれぞれindexの数値で受け取る。
     * @return 生成されたメッセージ（レビュー文）とメッセージの種別（ロール）をJSON用にMap型として返す。
     */
    @PostMapping("/submit")
    public Map<String, String> submit(@RequestBody Map<String, String> reqJson) {
        List<Message> messageList = generateMessageList(reqJson.get("theme1"), reqJson.get("theme2"));
        messageList.add(new AssistantMessage(reqJson.get("assistant")));
        messageList.add(new UserMessage(SUBMIT_ORDER + reqJson.get("user")));
        AssistantMessage assistantMessage = call(messageList);
        Map<String, String> resJson = new HashMap<>();
        resJson.put("role", assistantMessage.getMessageType().getValue());
        resJson.put("content", assistantMessage.getContent());

        return resJson;
    }

    /**
     * 引数で与えられたList型のオブジェクトからランダムで1つのindexを返す。（index = 0 を除く）
     * @param list ランダムで1つ選びたいList型のオブジェクト。
     * @return ランダムで選ばれたindex値を返す。index = 0 はランダムの選択肢のため0を返すことはない。
     */
    public int randomizeTheme(List<String> list) {
        int randomIndex = (int) (Math.random() * (list.size() - 1)) + 1;

        String decidedTheme = list.get(randomIndex);
        System.out.println("ランダム { 決定したテーマ : " + decidedTheme + ", 乱数：" + randomIndex + "}");
        return list.indexOf(decidedTheme);
    }

    /**
     * SystemMessage型とUserMessage型のオブジェクトを生成し、それらをList型にラップして返す。各Messageはapplication.ymlから定数として使用している。
     * @param theme1 UserMessage型オブジェクトに埋め込みたいテーマ名1。
     * @param theme2 UserMessage型オブジェクトに埋め込みたいテーマ名2。
     * @return SystemMessage型とUserMessage型のオブジェクトを連ねたList型オブジェクトを返す。
     */
    public List<Message> generateMessageList(String theme1, String theme2) {
        List<Message> messageList = new ArrayList<>();
        messageList.add(new SystemMessage(SYSTEM_MESSAGE));
        messageList.add(new UserMessage(GENERATE_ORDER
                .replace("***", "業界：「" + theme1 + "」、機能：「" + theme2 + "」")));
        return messageList;
    }

    /**
     * 与えられたMessage型のListに従って、SpringAIへ生成を指令する。
     * @param messageList 各Message型のオブジェクトを連ねたList型のオブジェクト。
     * @return LLMから生成されたテキストデータを内包するAssistantMessage型オブジェクト。
     */
    public AssistantMessage call(List<Message> messageList) {
        Prompt prompt = new Prompt(messageList);
        return CHAT_MODEL.call(prompt).getResult().getOutput();
    }
}
