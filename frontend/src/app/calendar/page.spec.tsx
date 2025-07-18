import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import CalendarPage from './page';
import { meetingApi } from './apis/meeting.api';

// テストデータ
const mockMeetings = [
  {
    id: '1',
    title: 'チームミーティング',
    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000),
    isImportant: false,
    ownerId: 'user1',
    participants: [],
  },
  {
    id: '2',
    title: '重要会議',
    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000),
    isImportant: true,
    ownerId: 'user1',
    participants: [],
  },
];

// モック設定
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: () => null,
}));

jest.mock('./apis/meeting.api', () => ({
  meetingApi: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('./hooks/useRealtimeSync', () => ({
  useGlobalRealtimeSync: jest.fn(),
}));

jest.mock('./hooks/useMeetingsQuery', () => ({
  useMeetingsSuspense: () => ({
    meetings: mockMeetings,
  }),
}));

jest.mock('./hooks/useCalendarState', () => {
  let state = {
    showMeetingForm: false,
    showMeetingDetail: false,
  };
  
  return {
    useCalendarState: () => ({
      selectedMeetingId: null,
      showMeetingForm: state.showMeetingForm,
      editingMeeting: null,
      selectedDate: null,
      showMeetingDetail: state.showMeetingDetail,
      handleDateSelect: jest.fn(),
      handleMeetingSelect: jest.fn(() => {
        state.showMeetingDetail = true;
      }),
      handleCreateMeeting: jest.fn(() => {
        state.showMeetingForm = true;
      }),
      handleEditMeeting: jest.fn(),
      handleCloseForm: jest.fn(),
      handleCloseDetail: jest.fn(),
    }),
  };
});

jest.mock('./hooks/useMeetingMutations', () => ({
  useMeetingActions: () => ({
    handleCreateMeeting: jest.fn((data) => {
      const createMock = require('./apis/meeting.api').meetingApi.create;
      return createMock(data);
    }),
    handleUpdateMeeting: jest.fn(),
    handleMeetingDelete: jest.fn(),
    handleAddParticipant: jest.fn(),
    handleRemoveParticipant: jest.fn(),
  }),
}));

jest.mock('./hooks/usePrefetchMeetings', () => ({
  usePrefetchMeetings: () => ({
    prefetchOnHover: jest.fn(),
    prefetchMeetingDetail: jest.fn(),
    prefetchMeetingsList: jest.fn(),
  }),
}));

jest.mock('./hooks/useReminderService', () => ({
  useReminderService: jest.fn(),
}));

// AuthContextのモック
jest.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    user: { email: 'test@example.com', name: 'Test User' },
    isLoading: false,
  }),
}));

// AuthenticatedLayoutのモック
jest.mock('@/components/AuthenticatedLayout', () => ({
  AuthenticatedLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="authenticated-layout">
      <div>Test User</div>
      {children}
    </div>
  ),
}));

// react-error-boundaryのモック
jest.mock('react-error-boundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// テストヘルパー
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
};

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('CalendarPage', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (meetingApi.getAll as jest.Mock).mockResolvedValue({
      success: true,
      data: mockMeetings,
    });
  });

  it('カレンダーページが正しく表示される', async () => {
    // Given
    // When
    renderWithProviders(<CalendarPage />);
    
    // Then
    expect(screen.getByTestId('authenticated-layout')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByTestId('calendar-view')).toBeInTheDocument();
    });
  });

  it('会議データが正しく表示される', async () => {
    // Given
    (meetingApi.getAll as jest.Mock).mockResolvedValue({
      success: true,
      data: mockMeetings,
    });
    
    // When
    renderWithProviders(<CalendarPage />);
    
    // Then
    await waitFor(() => {
      expect(screen.getByText(/チームミーティング/)).toBeInTheDocument();
      expect(screen.getByText(/重要会議/)).toBeInTheDocument();
    });
  });

  it('会議作成ボタンが表示される', async () => {
    // Given
    // When
    renderWithProviders(<CalendarPage />);
    
    // Then
    await waitFor(() => {
      expect(screen.getByText('会議を作成')).toBeInTheDocument();
    });
  });

  it('APIエラー時の処理', async () => {
    // Given
    (meetingApi.getAll as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    // When
    renderWithProviders(<CalendarPage />);
    
    // Then
    await waitFor(() => {
      // APIエラーが発生してもアプリがクラッシュしない
      expect(screen.getByTestId('authenticated-layout')).toBeInTheDocument();
    });
  });

  it('認証済みユーザーの情報が正しく表示される', async () => {
    // Given
    // When
    renderWithProviders(<CalendarPage />);
    
    // Then
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  it('リアルタイム同期機能が有効化される', async () => {
    // Given
    const mockUseGlobalRealtimeSync = require('./hooks/useRealtimeSync').useGlobalRealtimeSync;
    
    // When
    renderWithProviders(<CalendarPage />);
    
    // Then
    expect(mockUseGlobalRealtimeSync).toHaveBeenCalled();
  });
});