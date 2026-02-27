import { useState, useEffect } from 'react';
import { API_URL } from '../constants';
import { getNowDatetimeLocal } from '../utils/dateUtils';

export function useTodos(token, onLogout) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Tasks
  useEffect(() => {
    if (!token) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(API_URL, {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          if (onLogout) onLogout();
          return [];
        }
        return res.json();
      })
      .then(data => {
        setTasks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token, onLogout]);

  // Add Task
  const addTask = async (text, priority, dueDate) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({ text, priority, dueDate }),
      });
      if (res.ok) {
        const newTask = await res.json();
        setTasks(prev => [...prev, newTask]);
        return true;
      } else if (res.status === 401 || res.status === 403) {
        onLogout();
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  // Delete Task
  const deleteTask = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
      });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t._id !== id));
      } else if (res.status === 401 || res.status === 403) {
        onLogout();
      }
    } catch (e) { }
  };

  // Update Task (chung cho edit, toggle complete, reschedule)
  const updateTask = async (id, updates) => {
    const task = tasks.find(t => t._id === id);
    if (!task) return;

    // Merge dữ liệu cũ để tránh mất thông tin nếu backend yêu cầu đủ trường
    const payload = {
      text: task.text,
      priority: task.priority,
      dueDate: task.dueDate || getNowDatetimeLocal(),
      completed: task.completed,
      ...updates
    };

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks(prev => prev.map(t => t._id === id ? { ...t, ...updated } : t));
        return true;
      } else if (res.status === 401 || res.status === 403) {
        onLogout();
      }
    } catch (e) { }
    return false;
  };

  // Reorder (Drag & Drop)
  const reorderTasks = async (newOrder) => {
    // Optimistic update (cập nhật UI ngay lập tức)
    setTasks(newOrder);
    const payload = newOrder.map((t, idx) => ({ _id: t._id, position: idx }));
    try {
      await fetch(`${API_URL}/reorder`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({ order: payload }),
      });
    } catch (e) { }
  };

  // Smart Add
  const smartAddTask = async (text) => {
    try {
      const res = await fetch('https://my-to-do-listtt.onrender.com/api/todos/smart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({ prompt: text }),
      });
      if (res.ok) {
        // Sau khi AI thêm xong, load lại danh sách từ PRODUCTION
        fetch(API_URL, { headers: { Authorization: 'Bearer ' + token } })
          .then(r => r.json())
          .then(data => setTasks(Array.isArray(data) ? data : []));
        return true;
      } else {
        console.error("Lỗi 403 từ Server Production");
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  // Breakdown Task
  const breakdownTask = async (id) => {
    try {
      const res = await fetch(`https://my-to-do-listtt.onrender.com/api/todos/${id}/breakdown`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });
      if (res.ok) {
        // Refresh the whole list locally
        // (Đảm bảo API_URL ở file constants.js đang là production)
        fetch(API_URL, { headers: { Authorization: 'Bearer ' + token } })
          .then(r => r.json())
          .then(data => setTasks(Array.isArray(data) ? data : []));
        return true;
      } else {
        // Bẫy lỗi: In ra lời nhắn của Backend nếu bị từ chối
        console.error("Lỗi Breakdown từ Server:", await res.text());
      }
    } catch (e) {
      console.error("Lỗi mạng khi Breakdown:", e);
    }
    return false;
  };

  return { tasks, loading, addTask, deleteTask, updateTask, reorderTasks, smartAddTask, breakdownTask };
}