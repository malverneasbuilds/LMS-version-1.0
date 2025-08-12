import React, { useState, useCallback,useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { format, parseISO, isSameDay, isSameWeek, isSameMonth, isSameYear, addDays, subDays, addMonths, subMonths, addYears, subYears, startOfWeek, endOfWeek, eachDayOfInterval, getDay } from 'date-fns';
import { Text } from '../../components/typography/Text';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/tables/DataTable';
import { Button } from '../../components/ui/Button';
import { Plus, Check, X, CircleAlert as AlertCircle } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { Stack } from 'expo-router';

interface Event {
  id: string;
  date: string;
  type: string;
  event: string;
  tag: string;
  diagnosis: string;
  notes: string;
  doneBy: string;
  status: 'pending' | 'completed' | 'overdue';
}

interface Todo {
  id: string;
  date: string;
  description: string;
  status: 'pending' | 'completed' | 'overdue';
  createdBy: string;
  lastEdited: string;
  priority: 'high' | 'medium' | 'low';
}

interface Observation {
  id: string;
  date: string;
  tag: string;
  observation: string;
  observer: string;
  severity: 'high' | 'medium' | 'low';
}

// Helper function to generate random dates within the next 30 days
const getRandomDate = () => {
  const randomDays = Math.floor(Math.random() * 30);
  return format(addDays(new Date(), randomDays), 'yyyy-MM-dd');
};

// Sample data for farm events (5 random events)
const farmEvents: Event[] = Array.from({ length: 5 }, (_, i) => ({
  id: `fe-${i + 1}`,
  date: getRandomDate(),
  type: ['Vaccination', 'Treatment', 'Check-up', 'Breeding', 'Weaning'][Math.floor(Math.random() * 5)],
  event: ['Vaccine A', 'Antibiotics', 'Deworming', 'Pregnancy Check', 'Hoof Trimming'][Math.floor(Math.random() * 5)],
  tag: `#${Math.floor(100 + Math.random() * 900)}`,
  diagnosis: ['Preventive', 'Infection', 'Routine', 'Injury', 'Nutritional'][Math.floor(Math.random() * 5)],
  notes: ['First dose', 'Monitor closely', 'Follow up needed', 'All good', 'Needs attention'][Math.floor(Math.random() * 5)],
  doneBy: ['John Doe', 'Jane Smith', 'Dr. Wilson', 'Farm Hand'][Math.floor(Math.random() * 4)],
  status: ['pending', 'completed', 'overdue'][Math.floor(Math.random() * 3)] as 'pending' | 'completed' | 'overdue',
}));

// Sample data for todo list (8 random todos)
const todoList: Todo[] = Array.from({ length: 8 }, (_, i) => ({
  id: `td-${i + 1}`,
  date: getRandomDate(),
  description: [
    'Clean the barn',
    'Order more feed',
    'Schedule vet visit',
    'Fix broken fence',
    'Check water supply',
    'Vaccination reminder',
    'Move herd to new pasture',
    'Inspect equipment'
  ][Math.floor(Math.random() * 8)],
  status: ['pending', 'completed', 'overdue'][Math.floor(Math.random() * 3)] as 'pending' | 'completed' | 'overdue',
  createdBy: ['John Doe', 'Jane Smith', 'Farm Manager'][Math.floor(Math.random() * 3)],
  lastEdited: getRandomDate(),
  priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low',
}));

// Sample data for observations (6 random observations)
const observations: Observation[] = Array.from({ length: 6 }, (_, i) => ({
  id: `obs-${i + 1}`,
  date: getRandomDate(),
  tag: `#${Math.floor(100 + Math.random() * 900)}`,
  observation: [
    'Reduced appetite',
    'Slight limp',
    'Low egg production',
    'Unusual behavior',
    'Weight loss',
    'Scratching post',
    'Water intake low',
    'Aggressive behavior'
  ][Math.floor(Math.random() * 8)],
  severity: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low',
  observer: ['John Doe', 'Jane Smith', 'Farm Hand', 'Dr. Wilson'][Math.floor(Math.random() * 4)],
}));

export default function TasksScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Task Panel',
        }}
      />
      <TasksContent />
    </>
  );
}

type ViewType = 'day' | 'week' | 'month' | 'year' | 'list';
type CalendarEvent = Event | Todo | Observation;

function TasksContent() {
  const [activeTab, setActiveTab] = useState<'events' | 'todo' | 'observations'>('events');
  const [viewType, setViewType] = useState<ViewType>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const markedDates = useMemo(() => {
    const marked: { [date: string]: any } = {};
    
    // Count events by type for each date
    const eventsByDate: { [date: string]: { farm: number; todo: number; observation: number } } = {};
    
    // Count farm events
    farmEvents.forEach(event => {
      const date = event.date;
      if (!eventsByDate[date]) eventsByDate[date] = { farm: 0, todo: 0, observation: 0 };
      eventsByDate[date].farm++;
    });
    
    // Count todo items
    todoList.forEach(todo => {
      const date = todo.date;
      if (!eventsByDate[date]) eventsByDate[date] = { farm: 0, todo: 0, observation: 0 };
      eventsByDate[date].todo++;
    });
    
    // Count observations
    observations.forEach(obs => {
      const date = obs.date;
      if (!eventsByDate[date]) eventsByDate[date] = { farm: 0, todo: 0, observation: 0 };
      eventsByDate[date].observation++;
    });
    
    // Create marked dates with custom markers
    Object.entries(eventsByDate).forEach(([date, counts]) => {
      const hasFarm = counts.farm > 0;
      const hasTodo = counts.todo > 0;
      const hasObservation = counts.observation > 0;
      
      // Create custom marker with tags
      const markers = [];
      if (hasFarm) markers.push({ color: Colors.primary[500], text: 'E' });
      if (hasTodo) markers.push({ color: Colors.warning[500], text: 'T' });
      if (hasObservation) markers.push({ color: Colors.error[500], text: 'O' });
      
      marked[date] = {
        marked: true,
        customStyles: {
          container: {
            backgroundColor: 'transparent',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            padding: 2,
          },
          text: {
            color: Colors.neutral[900],
            fontWeight: 'bold',
          },
        },
        dots: markers.slice(0, 3), // Show up to 3 markers
      };
    });
    
    // Mark selected date
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    if (marked[selectedDateStr]) {
      marked[selectedDateStr].selected = true;
      marked[selectedDateStr].selectedColor = Colors.primary[200];
      marked[selectedDateStr].customStyles.text = {
        ...marked[selectedDateStr].customStyles?.text,
        color: Colors.primary[700],
        fontWeight: 'bold',
      };
    } else {
      marked[selectedDateStr] = {
        selected: true,
        selectedColor: Colors.primary[200],
        customStyles: {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: Colors.primary[700],
            fontWeight: 'bold',
          },
        },
      };
    }
    
    // Mark today
    const today = format(new Date(), 'yyyy-MM-dd');
    if (marked[today]) {
      marked[today].today = true;
      marked[today].customStyles = {
        ...marked[today].customStyles,
        container: {
          ...marked[today].customStyles?.container,
          borderWidth: 1,
          borderColor: Colors.primary[500],
          borderRadius: 16,
        },
      };
    } else {
      marked[today] = {
        today: true,
        customStyles: {
          container: {
            borderWidth: 1,
            borderColor: Colors.primary[500],
            borderRadius: 16,
          },
          text: {
            color: Colors.primary[500],
            fontWeight: 'bold',
          },
        },
      };
    }
    
    return marked;
  }, [farmEvents, todoList, observations, selectedDate]);

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    switch (activeTab) {
      case 'events':
        return farmEvents.filter(event => event.date === dateStr);
      case 'todo':
        return todoList.filter(todo => todo.date === dateStr);
      case 'observations':
        return observations.filter(obs => obs.date === dateStr);
      default:
        return [];
    }
  };

  const getEventsForView = (): CalendarEvent[] => {
    switch (viewType) {
      case 'day':
        return getEventsForDate(selectedDate);
      case 'week': {
        const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start, end });
        return days.flatMap(day => getEventsForDate(day));
      }
      case 'month': {
        const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        const days = eachDayOfInterval({ start, end });
        return days.flatMap(day => getEventsForDate(day));
      }
      case 'year': {
        const months = Array.from({ length: 12 }, (_, i) => 
          new Date(selectedDate.getFullYear(), i, 1)
        );
        return months.flatMap(month => getEventsForDate(month));
      }
      case 'list':
        switch (activeTab) {
          case 'events':
            return [...farmEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          case 'todo':
            return [...todoList].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          case 'observations':
            return [...observations].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          default:
            return [];
        }
      default:
        return [];
    }
  };

  const handleDayPress = (day: any) => {
    setSelectedDate(parseISO(day.dateString));
    if (viewType === 'month') {
      setViewType('day');
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    switch (viewType) {
      case 'day':
        setSelectedDate(prev => direction === 'prev' ? subDays(prev, 1) : addDays(prev, 1));
        break;
      case 'week':
        setSelectedDate(prev => direction === 'prev' ? subDays(prev, 7) : addDays(prev, 7));
        break;
      case 'month':
        setSelectedDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
        break;
      case 'year':
        setSelectedDate(prev => direction === 'prev' ? subYears(prev, 1) : addYears(prev, 1));
        break;
    }
  };

  const renderEventItem = (item: CalendarEvent) => {
    if ('event' in item) {
      // Farm Event
      return (
        <View style={styles.eventItem}>
          <View style={[styles.eventDot, { backgroundColor: Colors.primary[500] }]} />
          <View style={styles.eventContent}>
            <Text weight="medium">{item.event}</Text>
            <Text variant="caption" color="neutral.600">{item.type} • {item.tag}</Text>
          </View>
          <View style={styles.eventTime}>
            <Text variant="caption">{format(parseISO(item.date), 'h:mm a')}</Text>
            {renderStatusBadge(item.status)}
          </View>
        </View>
      );
    } else if ('description' in item) {
      // Todo
      return (
        <View style={styles.eventItem}>
          <View style={[styles.eventDot, { backgroundColor: Colors.warning[500] }]} />
          <View style={styles.eventContent}>
            <Text weight="medium">{item.description}</Text>
            <Text variant="caption" color="neutral.600">Priority: {item.priority}</Text>
          </View>
          <View style={styles.eventTime}>
            <Text variant="caption">{format(parseISO(item.date), 'h:mm a')}</Text>
            {renderStatusBadge(item.status)}
          </View>
        </View>
      );
    } else if ('observation' in item) {
      // Observation
      return (
        <View style={styles.eventItem}>
          <View style={[styles.eventDot, { backgroundColor: Colors.error[500] }]} />
          <View style={styles.eventContent}>
            <Text weight="medium">{item.observation}</Text>
            <Text variant="caption" color="neutral.600">Tag: {item.tag}</Text>
          </View>
          <View style={styles.eventTime}>
            <Text variant="caption">{format(parseISO(item.date), 'h:mm a')}</Text>
            <View style={[
              styles.severityBadge,
              {
                backgroundColor: item.severity === 'high' ? 'rgba(239, 68, 68, 0.1)' : 
                                item.severity === 'medium' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                borderColor: item.severity === 'high' ? Colors.error[400] : 
                            item.severity === 'medium' ? Colors.warning[400] : Colors.success[400],
              }
            ]}>
              <Text 
                variant="caption" 
                weight="medium"
                color={item.severity === 'high' ? 'error.600' : 
                      item.severity === 'medium' ? 'warning.600' : 'success.600'}
              >
                {item.severity.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      );
    }
    return null;
  };

  const renderStatusBadge = (status: string) => {
    const getStatusColor = () => {
      switch (status.toLowerCase()) {
        case 'completed':
          return {
            bg: Colors.success[100],
            text: Colors.success[700],
            icon: <Check size={14} color={Colors.success[700]} />,
          };
        case 'pending':
          return {
            bg: Colors.warning[100],
            text: Colors.warning[700],
            icon: <AlertCircle size={14} color={Colors.warning[700]} />,
          };
        default:
          return {
            bg: Colors.neutral[100],
            text: Colors.neutral[700],
            icon: <X size={14} color={Colors.neutral[700]} />,
          };
      }
    };

    const statusStyle = getStatusColor();

    return (
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: statusStyle.bg },
        ]}
      >
        {statusStyle.icon}
        <Text
          variant="caption"
          weight="medium"
          color={statusStyle.text}
          style={styles.statusText}
        >
          {status.toUpperCase()}
        </Text>
      </View>
    );
  };

  const renderPriorityBadge = (priority: string) => {
    const getPriorityColor = () => {
      switch (priority.toLowerCase()) {
        case 'high':
          return Colors.error[500];
        case 'medium':
          return Colors.warning[500];
        default:
          return Colors.neutral[500];
      }
    };

    return (
      <View
        style={[
          styles.priorityDot,
          { backgroundColor: getPriorityColor() },
        ]}
      />
    );
  };

  const renderCalendar = () => {
    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => navigateDate('prev')} style={styles.navButton}>
            <Text>‹</Text>
          </TouchableOpacity>
          <Text weight="medium">
            {viewType === 'day' && format(selectedDate, 'MMMM d, yyyy')}
            {viewType === 'week' && `${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d')} - ${format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}`}
            {viewType === 'month' && format(selectedDate, 'MMMM yyyy')}
            {viewType === 'year' && selectedDate.getFullYear()}
          </Text>
          <TouchableOpacity onPress={() => navigateDate('next')} style={styles.navButton}>
            <Text>›</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.viewTypeContainer}>
          {(['day', 'week', 'month', 'year', 'list'] as ViewType[]).map((view) => (
            <TouchableOpacity
              key={view}
              style={[
                styles.viewTypeButton,
                viewType === view && styles.activeViewType
              ]}
              onPress={() => setViewType(view)}
            >
              <Text
                variant="caption"
                weight={viewType === view ? 'medium' : 'regular'}
                color={viewType === view ? 'white' : 'neutral.600'}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {viewType !== 'list' && (
          <Calendar
            current={format(selectedDate, 'yyyy-MM-dd')}
            onDayPress={handleDayPress}
            markedDates={markedDates}
            hideExtraDays={viewType === 'month'}
            markingType={'custom'}
            dayComponent={({ date, state, marking }) => {
              const dateStr = date?.dateString || '';
              const isSelected = marking?.selected;
              const isToday = marking?.today;
              const dots = marking?.dots || [];
              
              return (
                <TouchableOpacity
                  onPress={() => handleDayPress({ dateString: dateStr })}
                  style={[
                    styles.dayContainer,
                    marking?.customStyles?.container,
                    isSelected && styles.selectedDay,
                    isToday && styles.today,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      state === 'disabled' && styles.disabledText,
                      marking?.customStyles?.text,
                    ]}
                  >
                    {date?.day}
                  </Text>
                  {dots.length > 0 && (
                    <View style={styles.markersContainer}>
                      {dots.map((dot: any, index: number) => (
                        <View 
                          key={index} 
                          style={[
                            styles.marker, 
                            { backgroundColor: dot.color }
                          ]}
                        >
                          <Text style={styles.markerText}>{dot.text}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
            theme={{
              selectedDayBackgroundColor: 'transparent',
              selectedDayTextColor: Colors.primary[700],
              todayTextColor: Colors.primary[500],
              arrowColor: Colors.primary[500],
              textDayFontWeight: '400',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14,
            }}
            style={styles.calendar}
          />
        )}
      </View>
    );
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.activeTab]}
          onPress={() => setActiveTab('events')}
        >
          <Text
            variant="body"
            weight={activeTab === 'events' ? 'medium' : 'regular'}
            color={activeTab === 'events' ? 'primary.500' : 'neutral.600'}
          >
            Farm Events
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'todo' && styles.activeTab]}
          onPress={() => setActiveTab('todo')}
        >
          <Text
            variant="body"
            weight={activeTab === 'todo' ? 'medium' : 'regular'}
            color={activeTab === 'todo' ? 'primary.500' : 'neutral.600'}
          >
            To-Do List
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'observations' && styles.activeTab]}
          onPress={() => setActiveTab('observations')}
        >
          <Text
            variant="body"
            weight={activeTab === 'observations' ? 'medium' : 'regular'}
            color={activeTab === 'observations' ? 'primary.500' : 'neutral.600'}
          >
            Observations
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {renderCalendar()}
        
        <View style={styles.actionBar}>
          <Text variant="h6" weight="medium">
            {viewType === 'day' && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            {viewType === 'week' && `${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d')} - ${format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}`}
            {viewType === 'month' && format(selectedDate, 'MMMM yyyy')}
            {viewType === 'year' && selectedDate.getFullYear()}
            {viewType === 'list' && 'All Events'}
          </Text>
          <Button
            variant="primary"
            startIcon={<Plus size={20} color={Colors.white} />}
            style={styles.addButton}
          >
            Add {activeTab === 'events' ? 'Event' : activeTab === 'todo' ? 'Task' : 'Observation'}
          </Button>
        </View>

        {viewType === 'list' ? (
          <FlatList
            data={getEventsForView()}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => renderEventItem(item)}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.eventsList}>
            {getEventsForView().length > 0 ? (
              getEventsForView().map((event) => (
                <View key={event.id} style={styles.eventItemWrapper}>
                  {renderEventItem(event)}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text color="neutral.500">No {activeTab} found for this {viewType}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

// Custom day component styles
const styles = StyleSheet.create({
  dayContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 18,
  },
  dayText: {
    fontSize: 14,
    color: Colors.neutral[900],
  },
  disabledText: {
    color: Colors.neutral[400],
  },
  selectedDay: {
    backgroundColor: Colors.primary[100],
  },
  today: {
    borderWidth: 1,
    borderColor: Colors.primary[500],
  },
  markersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  marker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 14,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  calendarContainer: {
    backgroundColor: Colors.white,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  calendar: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  navButton: {
    padding: 8,
  },
  viewTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  viewTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  activeViewType: {
    backgroundColor: Colors.primary[500],
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    backgroundColor: Colors.white,
    marginBottom: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary[500],
  },
  content: {
    flex: 1,
    paddingHorizontal: 0,
  },
  listContainer: {
    padding: 16,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.neutral[200],
    marginVertical: 8,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    backgroundColor: Colors.white,
  },
  addButton: {
    minWidth: 120,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  statusText: {
    marginLeft: 4,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
    marginRight: 8,
  },
  eventTime: {
    alignItems: 'flex-end',
  },
  eventsList: {
    padding: 16,
  },
  eventItemWrapper: {
    marginBottom: 8,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  observationsContainer: {
    padding: 0,
  },
  observationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  observationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  observationMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  observationText: {
    marginBottom: 8,
  },
  observer: {
    fontStyle: 'italic',
  },
});