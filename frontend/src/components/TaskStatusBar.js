import React from 'react';
import { 
  Box, Paper, Typography, Chip, LinearProgress,
  Accordion, AccordionSummary, AccordionDetails,
  List, ListItem, ListItemText
} from '@mui/material';
import { ExpandMore, CheckCircle, Error, HourglassEmpty } from '@mui/icons-material';

const TaskStatusBar = ({ tasks }) => {
  // Count tasks by status
  const pendingTasks = tasks.filter(task => ['pending', 'STARTED', 'PROGRESS'].includes(task.status)).length;
  const completedTasks = tasks.filter(task => task.status === 'success').length;
  const failedTasks = tasks.filter(task => task.status === 'error' || task.status === 'failure').length;
  
  // Determine overall status color
  let statusColor = 'info';
  if (pendingTasks > 0) statusColor = 'warning';
  if (completedTasks > 0 && pendingTasks === 0 && failedTasks === 0) statusColor = 'success';
  if (failedTasks > 0) statusColor = 'error';
  
  // Only show if there are tasks
  if (tasks.length === 0) return null;
  
  return (
    <Paper 
      sx={{ 
        p: 1, 
        mb: 2, 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000,
        borderLeft: 4, 
        borderColor: `${statusColor}.main` 
      }}
      elevation={2}
    >
      <Accordion disableGutters>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
              Task Status
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              {pendingTasks > 0 && (
                <Chip 
                  icon={<HourglassEmpty />} 
                  label={`Running: ${pendingTasks}`} 
                  color="warning" 
                  size="small" 
                  variant="outlined"
                />
              )}
              
              {completedTasks > 0 && (
                <Chip 
                  icon={<CheckCircle />} 
                  label={`Completed: ${completedTasks}`} 
                  color="success" 
                  size="small" 
                  variant="outlined"
                />
              )}
              
              {failedTasks > 0 && (
                <Chip 
                  icon={<Error />} 
                  label={`Failed: ${failedTasks}`} 
                  color="error" 
                  size="small" 
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        </AccordionSummary>
        
        <AccordionDetails>
          {pendingTasks > 0 && <LinearProgress sx={{ mb: 2 }} />}
          
          <List dense>
            {tasks.map((task) => (
              <ListItem key={task.id} divider>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2">
                        Task ID: {task.id}
                      </Typography>
                      <Chip 
                        label={task.status} 
                        color={
                          task.status === 'success' ? 'success' : 
                          (task.status === 'error' || task.status === 'failure') ? 'error' : 
                          ['pending', 'STARTED', 'PROGRESS'].includes(task.status) ? 'warning' : 
                          'default'
                        }
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" component="div">
                      {task.info && typeof task.info === 'object' 
                        ? JSON.stringify(task.info) 
                        : task.info || 'No additional information'}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default TaskStatusBar;
