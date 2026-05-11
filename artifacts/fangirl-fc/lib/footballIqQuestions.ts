export type FootballIqCategory =
  | "rules_basics"
  | "match_situations"
  | "world_cup_basics"
  | "tactics_lite"
  | "fan_culture";

export type FootballIqOption = {
  id: string;
  text: string;
};

export type FootballIqQuestion = {
  id: string;
  level: 1 | 2 | 3 | 4 | 5;
  category: FootballIqCategory;
  question: string;
  options: FootballIqOption[];
  correctOptionId: string;
  explanation: string;
};

export const FOOTBALL_IQ_QUESTIONS: FootballIqQuestion[] = [
  {
    id: "offside_basic_1",
    level: 1,
    category: "rules_basics",
    question: "What does offside usually mean?",
    options: [
      { id: "a", text: "An attacker is too far ahead when the ball is played" },
      { id: "b", text: "The ball goes out of the pitch" },
      { id: "c", text: "A player touches the ball twice" },
      { id: "d", text: "The goalkeeper leaves the goal" }
    ],
    correctOptionId: "a",
    explanation: "Offside is usually called when an attacker is ahead of the defenders too early when a teammate plays the ball."
  },
  {
    id: "yellow_card_1",
    level: 1,
    category: "rules_basics",
    question: "What is a yellow card?",
    options: [
      { id: "a", text: "A warning for a player" },
      { id: "b", text: "An automatic goal" },
      { id: "c", text: "A free substitution" },
      { id: "d", text: "The end of the match" }
    ],
    correctOptionId: "a",
    explanation: "A yellow card is a caution. If a player gets two yellow cards in the same match, they are sent off."
  },
  {
    id: "red_card_1",
    level: 1,
    category: "rules_basics",
    question: "What happens after a red card?",
    options: [
      { id: "a", text: "The player is sent off and the team plays with one fewer player" },
      { id: "b", text: "The team gets an extra goal" },
      { id: "c", text: "The match restarts from zero" },
      { id: "d", text: "The player changes position" }
    ],
    correctOptionId: "a",
    explanation: "A red card means the player is sent off, and their team usually continues with one fewer player."
  },
  {
    id: "penalty_basic_1",
    level: 1,
    category: "rules_basics",
    question: "When is a penalty kick usually awarded?",
    options: [
      { id: "a", text: "When a defending team commits a direct-free-kick foul inside its own penalty area" },
      { id: "b", text: "Whenever the ball hits the post" },
      { id: "c", text: "When the goalkeeper catches the ball" },
      { id: "d", text: "After every yellow card" }
    ],
    correctOptionId: "a",
    explanation: "A penalty is usually awarded when the defending team commits certain fouls inside its own penalty area."
  },
  {
    id: "corner_basic_1",
    level: 1,
    category: "rules_basics",
    question: "What is a corner kick?",
    options: [
      { id: "a", text: "A restart when the defending team last touches the ball before it crosses their goal line without a goal" },
      { id: "b", text: "A shot taken from midfield" },
      { id: "c", text: "A kick after every foul" },
      { id: "d", text: "A goalkeeper-only restart" }
    ],
    correctOptionId: "a",
    explanation: "A corner is given when the defending team touches the ball last before it crosses their own goal line without a goal."
  },
  {
    id: "free_kick_basic_1",
    level: 1,
    category: "rules_basics",
    question: "What is a free kick?",
    options: [
      { id: "a", text: "A restart awarded after certain fouls or offences" },
      { id: "b", text: "A bonus shot after a goal" },
      { id: "c", text: "A kick only goalkeepers can take" },
      { id: "d", text: "A replacement for penalties" }
    ],
    correctOptionId: "a",
    explanation: "A free kick is a restart awarded after certain fouls or offences. It can be direct or indirect depending on the situation."
  },
  {
    id: "var_basic_1",
    level: 2,
    category: "rules_basics",
    question: "What is VAR mainly used for?",
    options: [
      { id: "a", text: "Reviewing major decisions like goals, penalties, red cards, and mistaken identity" },
      { id: "b", text: "Choosing the best player" },
      { id: "c", text: "Counting the crowd" },
      { id: "d", text: "Changing team tactics" }
    ],
    correctOptionId: "a",
    explanation: "VAR helps review major match-changing decisions: goals, penalties, direct red cards, and mistaken identity."
  },
  {
    id: "stoppage_time_1",
    level: 2,
    category: "match_situations",
    question: "What is stoppage time?",
    options: [
      { id: "a", text: "Extra minutes added for delays during the half" },
      { id: "b", text: "A break for fans" },
      { id: "c", text: "Time when only goalkeepers play" },
      { id: "d", text: "A penalty round" }
    ],
    correctOptionId: "a",
    explanation: "Stoppage time is added for delays like injuries, substitutions, VAR checks, and other interruptions."
  },
  {
    id: "extra_time_1",
    level: 2,
    category: "world_cup_basics",
    question: "In knockout matches, what is extra time?",
    options: [
      { id: "a", text: "Two additional 15-minute periods if the match is tied" },
      { id: "b", text: "Five random minutes added after halftime" },
      { id: "c", text: "A replay match the next day" },
      { id: "d", text: "A bonus round before kickoff" }
    ],
    correctOptionId: "a",
    explanation: "In many knockout matches, if the game is tied, teams play two extra periods of 15 minutes."
  },
  {
    id: "penalty_shootout_1",
    level: 2,
    category: "world_cup_basics",
    question: "What is a penalty shootout?",
    options: [
      { id: "a", text: "A tiebreaker where teams take penalties after a knockout match remains tied" },
      { id: "b", text: "A warm-up before the match" },
      { id: "c", text: "A way to replace injured players" },
      { id: "d", text: "A type of corner kick" }
    ],
    correctOptionId: "a",
    explanation: "A penalty shootout is used as a tiebreaker after extra time when a knockout match is still tied."
  },
  {
    id: "clean_sheet_1",
    level: 2,
    category: "match_situations",
    question: "What is a clean sheet?",
    options: [
      { id: "a", text: "A team finishes the match without conceding a goal" },
      { id: "b", text: "A match with no yellow cards" },
      { id: "c", text: "A freshly painted pitch" },
      { id: "d", text: "A goalkeeper scoring a goal" }
    ],
    correctOptionId: "a",
    explanation: "A clean sheet means a team did not concede any goals in the match."
  },
  {
    id: "counterattack_1",
    level: 2,
    category: "match_situations",
    question: "What is a counterattack?",
    options: [
      { id: "a", text: "A fast attack right after winning the ball back" },
      { id: "b", text: "A defensive wall before a free kick" },
      { id: "c", text: "A substitution strategy" },
      { id: "d", text: "A goalkeeper throw-in" }
    ],
    correctOptionId: "a",
    explanation: "A counterattack happens when a team wins the ball and attacks quickly before the opponent can reorganize."
  },
  {
    id: "pressing_1",
    level: 3,
    category: "tactics_lite",
    question: "What does pressing mean in football?",
    options: [
      { id: "a", text: "Putting pressure on opponents to win the ball back" },
      { id: "b", text: "Shooting from far away" },
      { id: "c", text: "Standing near the referee" },
      { id: "d", text: "Only defending inside the goal" }
    ],
    correctOptionId: "a",
    explanation: "Pressing means players try to close down opponents quickly and force a mistake or win the ball."
  },
  {
    id: "formation_1",
    level: 3,
    category: "tactics_lite",
    question: "What does a formation like 4-3-3 describe?",
    options: [
      { id: "a", text: "How players are arranged on the pitch" },
      { id: "b", text: "The final score" },
      { id: "c", text: "How many fans are in the stadium" },
      { id: "d", text: "The number of referees" }
    ],
    correctOptionId: "a",
    explanation: "A formation describes how a team lines up, usually counting defenders, midfielders, and forwards."
  },
  {
    id: "captain_1",
    level: 3,
    category: "tactics_lite",
    question: "What is the captain's role?",
    options: [
      { id: "a", text: "Lead the team and communicate with the referee" },
      { id: "b", text: "Choose all substitutions alone" },
      { id: "c", text: "Replace the coach" },
      { id: "d", text: "Always take every penalty" }
    ],
    correctOptionId: "a",
    explanation: "The captain leads the team on the pitch and is often the main player communicating with the referee."
  },
  {
    id: "substitution_1",
    level: 2,
    category: "match_situations",
    question: "Why do coaches make substitutions?",
    options: [
      { id: "a", text: "To bring fresh energy, change tactics, or replace tired/injured players" },
      { id: "b", text: "To pause the score" },
      { id: "c", text: "To restart the match" },
      { id: "d", text: "To cancel a yellow card" }
    ],
    correctOptionId: "a",
    explanation: "Substitutions can change the rhythm of a match, bring fresh legs, or solve tactical problems."
  },
  {
    id: "defend_lead_1",
    level: 3,
    category: "match_situations",
    question: "Your team is winning 1\u20130 in the last minutes. What is usually smart?",
    options: [
      { id: "a", text: "Stay organized, avoid risky mistakes, and manage the game" },
      { id: "b", text: "Send every player forward" },
      { id: "c", text: "Let the goalkeeper attack alone" },
      { id: "d", text: "Stop defending completely" }
    ],
    correctOptionId: "a",
    explanation: "Late in a match, teams often protect the lead by staying compact and avoiding unnecessary risks."
  },
  {
    id: "losing_late_1",
    level: 3,
    category: "match_situations",
    question: "Your team is losing late in the match. What might they do?",
    options: [
      { id: "a", text: "Push more players forward and take more attacking risks" },
      { id: "b", text: "Stop trying to score" },
      { id: "c", text: "Remove the goalkeeper without reason" },
      { id: "d", text: "Ignore the ball" }
    ],
    correctOptionId: "a",
    explanation: "When a team is losing late, they often take more attacking risks to try to equalize."
  },
  {
    id: "group_stage_1",
    level: 4,
    category: "world_cup_basics",
    question: "What is the World Cup group stage?",
    options: [
      { id: "a", text: "The first phase where teams play matches in groups" },
      { id: "b", text: "The final match only" },
      { id: "c", text: "A training session" },
      { id: "d", text: "A fan voting round" }
    ],
    correctOptionId: "a",
    explanation: "In the group stage, teams play several matches in their group to try to qualify for the knockout rounds."
  },
  {
    id: "wc_points_1",
    level: 4,
    category: "world_cup_basics",
    question: "In a group stage, how many points does a team usually get for a win?",
    options: [
      { id: "a", text: "3 points" },
      { id: "b", text: "1 point" },
      { id: "c", text: "2 points" },
      { id: "d", text: "0 points" }
    ],
    correctOptionId: "a",
    explanation: "In football group stages, a win usually gives 3 points, a draw gives 1, and a loss gives 0."
  },
  {
    id: "draw_points_1",
    level: 4,
    category: "world_cup_basics",
    question: "What does a draw mean in football?",
    options: [
      { id: "a", text: "Both teams finish with the same score" },
      { id: "b", text: "One team wins by penalties immediately" },
      { id: "c", text: "The referee cancels the match" },
      { id: "d", text: "The match has no goalkeeper" }
    ],
    correctOptionId: "a",
    explanation: "A draw means the teams finish the match with the same score, like 1\u20131 or 0\u20130."
  },
  {
    id: "goal_difference_1",
    level: 4,
    category: "world_cup_basics",
    question: "What is goal difference?",
    options: [
      { id: "a", text: "Goals scored minus goals conceded" },
      { id: "b", text: "The distance between the two goals" },
      { id: "c", text: "The number of yellow cards" },
      { id: "d", text: "The number of substitutions" }
    ],
    correctOptionId: "a",
    explanation: "Goal difference is calculated by subtracting goals conceded from goals scored."
  },
  {
    id: "knockout_stage_1",
    level: 4,
    category: "world_cup_basics",
    question: "What happens in a knockout match?",
    options: [
      { id: "a", text: "One team must advance and the other is eliminated" },
      { id: "b", text: "Both teams always advance" },
      { id: "c", text: "The score does not matter" },
      { id: "d", text: "Only defenders can score" }
    ],
    correctOptionId: "a",
    explanation: "In knockout rounds, one team advances and the other is eliminated."
  },
  {
    id: "round_of_32_1",
    level: 4,
    category: "world_cup_basics",
    question: "Why is the 2026 World Cup format different?",
    options: [
      { id: "a", text: "It has 48 teams and a larger knockout phase" },
      { id: "b", text: "It has no group stage" },
      { id: "c", text: "Only one country hosts it" },
      { id: "d", text: "Matches last 30 minutes" }
    ],
    correctOptionId: "a",
    explanation: "The 2026 World Cup expands to 48 teams, creating a larger tournament and knockout phase."
  },
  {
    id: "fan_watch_1",
    level: 1,
    category: "fan_culture",
    question: "If you are new to football, what is the best way to start watching?",
    options: [
      { id: "a", text: "Follow the ball, notice the score, and watch how teams attack and defend" },
      { id: "b", text: "Only watch the crowd" },
      { id: "c", text: "Ignore the referee completely" },
      { id: "d", text: "Try to understand every tactic at once" }
    ],
    correctOptionId: "a",
    explanation: "Start simple: follow the ball, the score, and how teams move between attack and defense."
  },
  {
    id: "watch_with_friends_1",
    level: 1,
    category: "fan_culture",
    question: "Watching with friends, what helps you enjoy the match more?",
    options: [
      { id: "a", text: "Ask simple questions and learn as the match goes" },
      { id: "b", text: "Pretend you know everything" },
      { id: "c", text: "Avoid looking at the score" },
      { id: "d", text: "Only check your phone" }
    ],
    correctOptionId: "a",
    explanation: "Football is easier to enjoy when you ask simple questions and learn naturally during the match."
  },
  {
    id: "momentum_1",
    level: 3,
    category: "match_situations",
    question: "What does it mean when people say a team has momentum?",
    options: [
      { id: "a", text: "They are controlling the match and creating pressure" },
      { id: "b", text: "They are losing by default" },
      { id: "c", text: "They have more fans" },
      { id: "d", text: "They changed their jersey" }
    ],
    correctOptionId: "a",
    explanation: "Momentum means a team looks stronger in that period, often attacking more and creating chances."
  },
  {
    id: "chance_1",
    level: 2,
    category: "match_situations",
    question: "What is a big chance?",
    options: [
      { id: "a", text: "A very good opportunity to score" },
      { id: "b", text: "A random pass at midfield" },
      { id: "c", text: "A goalkeeper drinking water" },
      { id: "d", text: "A referee talking to a coach" }
    ],
    correctOptionId: "a",
    explanation: "A big chance is a moment where a team has a strong opportunity to score."
  },
  {
    id: "defensive_line_1",
    level: 3,
    category: "tactics_lite",
    question: "What is a defensive line?",
    options: [
      { id: "a", text: "How high or deep defenders position themselves" },
      { id: "b", text: "A painted line on the ball" },
      { id: "c", text: "The referee's running path" },
      { id: "d", text: "The fans behind the goal" }
    ],
    correctOptionId: "a",
    explanation: "A defensive line describes where defenders position themselves, either higher up the pitch or deeper near their goal."
  },
  {
    id: "worldcup_ready_1",
    level: 5,
    category: "fan_culture",
    question: "What is the smartest way to get World Cup ready?",
    options: [
      { id: "a", text: "Learn the basics, pick teams to follow, and watch matches with curiosity" },
      { id: "b", text: "Memorize every player immediately" },
      { id: "c", text: "Only watch highlights after the final" },
      { id: "d", text: "Avoid asking questions" }
    ],
    correctOptionId: "a",
    explanation: "You do not need to know everything. Learn the basics, follow teams, and enjoy the story of the tournament."
  }
];
