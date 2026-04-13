import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";
import { Client } from '@stomp/stompjs';

interface BallDetail {
  ballNumber: number;
  runs: number;
  extras: string;
  isWicket: boolean;
  batsman: string;
}

interface OverDetail {
  overNumber: number;
  bowler: string;
  runs: number;
  wickets: number;
  balls: BallDetail[];
}

interface InningsScore {
  inningsNumber: number;
  totalRuns: number;
  wickets: number;
  overs: OverDetail[];
}

interface LiveScoreData {
  id: number;
  matchId: number;
  currentInnings: number;
  inningsScores: InningsScore[];
  isLive: boolean;
  currentBowler: string;
  currentBatsmen: string[];
  createdAt: string;
  updatedAt: string;
}

interface ScorecardProps {
  match: any;
  onBackToMatch: () => void;
}

const LIVE_SCORE_API = "http://localhost:7774/api/livescore";

export const Scorecard = ({ match, onBackToMatch }: ScorecardProps) => {
  const [liveScore, setLiveScore] = useState<LiveScoreData | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [ws, setWs] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to count completed overs (6 valid balls = 1 over)
  const countCompletedOvers = (overs) => {
    if (!overs || overs.length === 0) return 0;
    
    return overs.filter(over => {
      if (!over.balls || over.balls.length === 0) return false;
      
      // Count valid balls (excluding wides and no-balls)
      const validBalls = over.balls.filter(ball => 
        !ball.extras || (ball.extras !== 'WIDE' && ball.extras !== 'NO_BALL')
      );
      
      return validBalls.length >= 6;
    }).length;
  };

  // Function to check if innings should end - ONLY for first innings
  const shouldChangeInnings = (liveScore, currentInningsData, matchOvers) => {
    // Only check for first innings
    if (!liveScore || liveScore.currentInnings !== 1) return false;
    if (!currentInningsData || !currentInningsData.overs) return false;
    
    const completedOvers = countCompletedOvers(currentInningsData.overs);
    return completedOvers >= matchOvers;
  };

  // Initialize live score when component mounts
  useEffect(() => {
    initializeLiveScore();
    
    return () => {
      if (ws && "deactivate" in ws) {
        (ws as any).deactivate();
        console.log("STOMP client disconnected");
      }
    };
  }, [match.id]);

  const initializeLiveScore = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Initializing live score for match:', match.id);
      
      const response = await fetch(`${LIVE_SCORE_API}/match/${match.id}/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        // If initialization fails, try to get existing score
        const getResponse = await fetch(`${LIVE_SCORE_API}/match/${match.id}`);
        if (getResponse.ok) {
          const data = await getResponse.json();
          setLiveScore(data);
          setIsLive(data.isLive);
          setupWebSocket();
          return;
        }
        throw new Error(`Failed to initialize live score: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Live score initialized:', data);
      setLiveScore(data);
      setIsLive(data.isLive);
      setupWebSocket();
    } catch (error) {
      console.error('Error initializing live score:', error);
      setError('Failed to load live score. Please check if the LiveScore service is running.');
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    try {
      const client = new Client({
        brokerURL: "ws://localhost:7774/ws-livescore",
        reconnectDelay: 5000,

        onConnect: () => {
          console.log("✅ STOMP connected to WebSocket");

          client.subscribe("/topic/score-updates", (message) => {
            try {
              const scoreUpdate = JSON.parse(message.body);
              console.log("📩 Received score update:", scoreUpdate);
              if (scoreUpdate.data) {
                setLiveScore(scoreUpdate.data);
                setIsLive(scoreUpdate.data.isLive);
              } else {
                fetch(`${LIVE_SCORE_API}/match/${match.id}`)
                  .then(res => res.json())
                  .then(data => {
                    setLiveScore(data);
                    setIsLive(data.isLive);
                    console.log("🔄 Fetched updated live score via REST after STOMP message");
                  })
                  .catch(err => console.error("Failed to fetch updated live score:", err));
              }
            } catch (err) {
              console.error("❌ Failed to parse STOMP message:", err);
            }
          });
        },

        onStompError: (frame) => {
          console.error("STOMP error:", frame);
          setError("WebSocket (STOMP) error occurred");
        },

        onWebSocketClose: () => {
          console.log("❌ STOMP disconnected");
          setWs(null);
        },
      });

      client.activate();
      setWs(client);
    } catch (err) {
      console.error("Error setting up STOMP WebSocket:", err);
      setError("Failed to setup STOMP connection");
    }
  };

  const currentInningsData = liveScore?.inningsScores?.find(
    innings => innings.inningsNumber === liveScore.currentInnings
  );

  const currentOver = currentInningsData?.overs?.[currentInningsData.overs.length - 1];
  const ballsInOver = currentOver?.balls?.length || 0;
  const oversCompleted = (currentInningsData?.overs?.length || 1) - 1;
  const totalBallsBowled = (oversCompleted * 6) + ballsInOver;
  const totalBallsInMatch = match.overs * 6;
  const ballsRemaining = totalBallsInMatch - totalBallsBowled;

  // Function to add ball event
  const addBallEvent = async (runs: number, isWicket = false, extras?: string) => {
    if (!liveScore || !isLive) {
      console.log('Cannot add ball: match not live or score not loaded');
      return;
    }

    // ✅ FIX: Only check for innings change in first innings
    if (liveScore.currentInnings === 1) {
      const currentInningsData = liveScore.inningsScores.find(
        inn => inn.inningsNumber === liveScore.currentInnings
      );
      
      const completedOvers = countCompletedOvers(currentInningsData?.overs || []);
      
      // Check if 5 overs completed (for 5-over match)
      if (completedOvers >= match.overs) {
        const userConfirmed = window.confirm(
          `First innings completed! ${completedOvers} overs bowled.\n\nDo you want to start the second innings?`
        );
        
        if (userConfirmed) {
          await changeInnings();
          // After changing innings, don't add the ball - let user start fresh
          return;
        } else {
          alert('Please change innings before adding more balls.');
          return;
        }
      }
    }

    // ✅ FIX: Prevent adding balls if second innings is completed
    if (liveScore.currentInnings >= 2) {
      const secondInnings = liveScore.inningsScores.find(
        inn => inn.inningsNumber === 2
      );
      const completedOversInnings2 = countCompletedOvers(secondInnings?.overs || []);
      
      if (completedOversInnings2 >= match.overs) {
        alert('Match completed! Both innings finished.');
        return;
      }
    }

    // Proceed with adding the ball
    const ballEvent = {
      runs,
      extras,
      isWicket,
      batsman: liveScore.currentBatsmen[0] || "Batsman 1",
      bowler: liveScore.currentBowler || "Bowler 1"
    };

    try {
      console.log('Sending ball event:', ballEvent);
      const response = await fetch(`${LIVE_SCORE_API}/match/${match.id}/ball`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ballEvent)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      console.log('Ball event successfully sent');
    } catch (error) {
      console.error('Error updating score:', error);
      setError('Failed to update score. Please try again.');
    }
  };

  // Function to toggle live status
  const toggleLiveStatus = async () => {
    try {
      setError(null);
      const response = await fetch(`${LIVE_SCORE_API}/match/${match.id}/live?isLive=${!isLive}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setLiveScore(data);
      setIsLive(data.isLive);
    } catch (error) {
      console.error('Error toggling live status:', error);
      setError('Failed to change match status');
    }
  };

  // Function to change innings
  const changeInnings = async () => {
    try {
      setError(null);
      
      // ✅ ADD: Check if we're already in second innings
      if (liveScore && liveScore.currentInnings >= 2) {
        alert('Match already completed!');
        return;
      }

      const response = await fetch(`${LIVE_SCORE_API}/match/${match.id}/change-innings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setLiveScore(data);
      console.log('Innings changed to:', data.currentInnings);
      alert(`Second innings started! ${match.overs} overs remaining.`);
    } catch (error) {
      console.error('Error changing innings:', error);
      if (error.message.includes('500')) {
        setError('Cannot change innings - match may already be completed');
      } else {
        setError('Failed to change innings');
      }
    }
  };

  // Function to get match result
  const getMatchResult = () => {
    if (!liveScore || liveScore.currentInnings === 1 || isLive) return null;
    
    const innings1 = liveScore.inningsScores.find(i => i.inningsNumber === 1);
    const innings2 = liveScore.inningsScores.find(i => i.inningsNumber === 2);
    
    if (!innings1 || !innings2) return null;
    
    const target = innings1.totalRuns + 1;
    const chasing = innings2.totalRuns;
    
    if (chasing >= target) {
      const wicketsLeft = 10 - innings2.wickets;
      const team2Name = liveScore.currentInnings === 2 ? 
        (match.tossDecision === 'BAT' ? match.tossWinner : (match.tossWinner === match.team1 ? match.team2 : match.team1)) :
        match.tossWinner;
      return `${team2Name} won by ${wicketsLeft} wicket${wicketsLeft !== 1 ? 's' : ''}`;
    } else if (ballsRemaining <= 0 || innings2.wickets >= 10) {
      const runsMargin = innings1.totalRuns - innings2.totalRuns;
      const team1Name = liveScore.currentInnings === 1 ? 
        (match.tossDecision === 'BAT' ? match.tossWinner : (match.tossWinner === match.team1 ? match.team2 : match.team1)) :
        match.tossWinner;
      return `${team1Name} won by ${runsMargin} run${runsMargin !== 1 ? 's' : ''}`;
    }
    
    return null;
  };

  const getRunRate = () => {
    if (!currentInningsData) return '0.00';
    const totalBalls = oversCompleted * 6 + ballsInOver;
    return totalBalls > 0 ? ((currentInningsData.totalRuns / totalBalls) * 6).toFixed(2) : '0.00';
  };

  const getRequiredRunRate = () => {
    if (!liveScore || liveScore.currentInnings === 1) return '-';
    const innings1 = liveScore.inningsScores.find(i => i.inningsNumber === 1);
    if (!innings1) return '-';
    const target = innings1.totalRuns + 1;
    const required = target - (currentInningsData?.totalRuns || 0);
    return ballsRemaining > 0 ? ((required / ballsRemaining) * 6).toFixed(2) : '-';
  };

  const formatOvers = (overs: number, balls: number) => {
    return `${overs}.${balls}`;
  };

  const getCurrentBattingTeam = () => {
    if (!liveScore) return '';
    
    if (liveScore.currentInnings === 1) {
      return match.tossDecision === 'BAT' ? match.tossWinner : 
             (match.tossWinner === match.team1 ? match.team2 : match.team1);
    } else {
      return match.tossDecision === 'BAT' ? 
             (match.tossWinner === match.team1 ? match.team2 : match.team1) : 
             match.tossWinner;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div>Loading live score...</div>
          <div className="text-sm text-muted-foreground mt-2">Initializing match {match.id}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4 text-lg">Error</div>
          <div className="text-muted-foreground mb-4">{error}</div>
          <div className="space-y-2">
            <Button onClick={initializeLiveScore} className="w-full">
              Retry
            </Button>
            <Button onClick={onBackToMatch} variant="outline" className="w-full">
              Back to Matches
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-4">
            Make sure LiveScore service is running on port 7774
          </div>
        </div>
      </div>
    );
  }

  if (!liveScore) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">Failed to load live score</div>
          <Button onClick={initializeLiveScore}>Retry</Button>
        </div>
      </div>
    );
  }

  const completedOversInCurrentInnings = countCompletedOvers(currentInningsData?.overs || []);

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBackToMatch}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Match
        </Button>
        <div className="flex items-center space-x-2">
          <Button
            variant={isLive ? "destructive" : "success"}
            onClick={toggleLiveStatus}
            size="sm"
          >
            {isLive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isLive ? 'Pause' : 'Start'}
          </Button>
          <Badge variant={isLive ? "default" : "secondary"}>
            {isLive ? 'LIVE' : 'PAUSED'}
          </Badge>
          {/* ✅ FIXED: Only show change innings button when appropriate */}
          {shouldChangeInnings(liveScore, currentInningsData, match.overs) && (
            <Button onClick={changeInnings} variant="outline" size="sm">
              Change Innings ({completedOversInCurrentInnings}/{match.overs} overs)
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            {match.team1} vs {match.team2}
          </CardTitle>
          <div className="text-center text-sm text-muted-foreground">
            {match.overs} Overs Match • {match.venue}
          </div>
          {getMatchResult() && (
            <div className="text-center">
              <Badge variant="default" className="text-lg py-2 px-4 bg-green-600 text-white">
                {getMatchResult()}
              </Badge>
            </div>
          )}
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {getCurrentBattingTeam()} Batting
              </span>
              <Badge>{liveScore.currentInnings === 1 ? '1st Innings' : '2nd Innings'}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold">
                {currentInningsData?.totalRuns || 0}/{currentInningsData?.wickets || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatOvers(oversCompleted, ballsInOver)} overs
                {liveScore.currentInnings === 1 && (
                  <span className="ml-2">({completedOversInCurrentInnings} completed)</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Run Rate:</span>
                <span className="ml-2 font-medium">{getRunRate()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Required RR:</span>
                <span className="ml-2 font-medium">{getRequiredRunRate()}</span>
              </div>
            </div>

            <Progress 
              value={((oversCompleted * 6 + ballsInOver) / (match.overs * 6)) * 100} 
              className="h-2"
            />

            <div className="space-y-2">
              <div className="text-sm font-medium">Current Over:</div>
              <div className="flex space-x-1">
                {currentOver?.balls?.map((ball, index) => (
                  <Badge 
                    key={index} 
                    variant={ball.isWicket ? "destructive" : ball.extras ? "outline" : "secondary"}
                  >
                    {ball.isWicket ? 'W' : ball.extras ? `${ball.extras === 'WIDE' ? 'Wd' : 'Nb'}+${ball.runs}` : ball.runs}
                  </Badge>
                ))}
                {Array.from({ length: 6 - ballsInOver }).map((_, index) => (
                  <div key={index} className="w-6 h-6 border border-dashed rounded border-muted-foreground/30" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {isLive && (
          <Card>
            <CardHeader>
              <CardTitle>Scoring Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                <Button onClick={() => addBallEvent(0)} variant="outline">0</Button>
                <Button onClick={() => addBallEvent(1)} variant="outline">1</Button>
                <Button onClick={() => addBallEvent(2)} variant="outline">2</Button>
                <Button onClick={() => addBallEvent(3)} variant="outline">3</Button>
                <Button onClick={() => addBallEvent(4)} variant="accent">4</Button>
                <Button onClick={() => addBallEvent(5)} variant="outline">5</Button>
                <Button onClick={() => addBallEvent(6)} variant="success">6</Button>
                <Button onClick={() => addBallEvent(0, true)} variant="destructive">
                  OUT
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => addBallEvent(1, false, 'WIDE')} variant="outline" size="sm">
                  Wide + 1
                </Button>
                <Button onClick={() => addBallEvent(1, false, 'NO_BALL')} variant="outline" size="sm">
                  No Ball + 1
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="scorecard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scorecard">Scorecard</TabsTrigger>
          <TabsTrigger value="overs">Overs</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scorecard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {match.tossDecision === 'BAT' ? match.tossWinner : (match.tossWinner === match.team1 ? match.team2 : match.team1)} - 1st Innings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {liveScore.inningsScores[0]?.totalRuns || 0}/{liveScore.inningsScores[0]?.wickets || 0} 
                ({formatOvers(liveScore.inningsScores[0]?.overs?.length || 0, 0)} overs)
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {countCompletedOvers(liveScore.inningsScores[0]?.overs || [])} completed overs
              </div>
            </CardContent>
          </Card>
          
          {liveScore.currentInnings === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {match.tossDecision === 'BAT' ? (match.tossWinner === match.team1 ? match.team2 : match.team1) : match.tossWinner} - 2nd Innings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {liveScore.inningsScores[1]?.totalRuns || 0}/{liveScore.inningsScores[1]?.wickets || 0} 
                  ({formatOvers(liveScore.inningsScores[1]?.overs?.length || 0, ballsInOver)} overs)
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Need {(liveScore.inningsScores[0]?.totalRuns || 0) + 1 - (liveScore.inningsScores[1]?.totalRuns || 0)} runs from {ballsRemaining} balls
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="overs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Over by Over</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentInningsData?.overs?.map((over, index) => {
                  const validBalls = over.balls.filter(ball => 
                    !ball.extras || (ball.extras !== 'WIDE' && ball.extras !== 'NO_BALL')
                  );
                  const isOverCompleted = validBalls.length >= 6;
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Over {over.overNumber}</span>
                        {isOverCompleted && (
                          <Badge variant="outline" className="text-xs">Completed</Badge>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        {over.balls.map((ball, ballIndex) => (
                          <Badge key={ballIndex} variant={ball.isWicket ? "destructive" : "secondary"} className="text-xs">
                            {ball.isWicket ? 'W' : ball.runs}
                          </Badge>
                        ))}
                      </div>
                      <span className="font-medium">{over.runs} runs</span>
                    </div>
                  );
                })}
                {(!currentInningsData?.overs || currentInningsData.overs.length === 0) && (
                  <div className="text-center text-muted-foreground py-4">
                    No overs bowled yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{match.team1} Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Runs:</span>
                    <span className="font-medium">{liveScore.inningsScores[0]?.totalRuns || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wickets:</span>
                    <span className="font-medium">{liveScore.inningsScores[0]?.wickets || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overs:</span>
                    <span className="font-medium">{formatOvers(liveScore.inningsScores[0]?.overs?.length || 0, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed Overs:</span>
                    <span className="font-medium">{countCompletedOvers(liveScore.inningsScores[0]?.overs || [])}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {liveScore.currentInnings === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>{match.team2} Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Runs:</span>
                      <span className="font-medium">{liveScore.inningsScores[1]?.totalRuns || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wickets:</span>
                      <span className="font-medium">{liveScore.inningsScores[1]?.wickets || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overs:</span>
                      <span className="font-medium">{formatOvers(liveScore.inningsScores[1]?.overs?.length || 0, ballsInOver)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed Overs:</span>
                      <span className="font-medium">{countCompletedOvers(liveScore.inningsScores[1]?.overs || [])}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};